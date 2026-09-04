const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const TimetableTemplate = require('../models/TimetableTemplate');
const auth = require('../middleware/auth');
const { format, parseISO, getDay } = require('date-fns');

const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// GET /api/tasks/templates
// Fetches all 7 timetable templates for full weekly view
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await TimetableTemplate.find({});
    // Order by Monday to Sunday
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    templates.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// PUT /api/tasks/templates/:day
// Updates the timetable template for a specific day
router.put('/templates/:day', auth, async (req, res) => {
  try {
    const { day } = req.params;
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    const template = await TimetableTemplate.findOneAndUpdate(
      { day },
      { tasks },
      { new: true, upsert: true } // Upsert just in case it doesn't exist
    );

    res.json(template);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/tasks/missed
// Fetches missed tasks (tasks that were scheduled before today or earlier today and not completed)
router.get('/missed', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const currentTimeStr = format(new Date(), 'HH:mm');

    const { subDays } = require('date-fns');
    const threeDaysAgoStr = format(subDays(new Date(), 3), 'yyyy-MM-dd');

    // Find all incomplete tasks from the last 3 days up to today
    const incompleteTasks = await Task.find({
      userId,
      completed: false,
      date: { $gte: threeDaysAgoStr }
    }).sort({ date: -1, startTime: 1 });

    const missed = incompleteTasks.filter(t => {
      if (t.date < todayStr) return true;
      if (t.date === todayStr && t.endTime < currentTimeStr) return true;
      return false;
    });

    res.json(missed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/tasks/export
// Exports all user tasks as JSON
router.get('/export', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ userId });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=placement_tracker_backup.json');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST /api/tasks/import
// Imports tasks from backup JSON array
router.post('/import', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Expected an array of tasks' });
    }

    let insertedOrUpdated = 0;
    for (const t of tasks) {
      await Task.findOneAndUpdate(
        { userId, date: t.date, taskId: t.taskId },
        { ...t, userId },
        { upsert: true, new: true }
      );
      insertedOrUpdated++;
    }

    res.json({ success: true, count: insertedOrUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/tasks/:date
// Fetches tasks for a specific date (YYYY-MM-DD). If none exist, generates from template.
router.get('/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    
    let tasks = await Task.find({ userId, date }).sort({ startTime: 1 });
    
    if (tasks.length === 0) {
      const dateObj = parseISO(date);
      const dayName = daysMap[getDay(dateObj)];
      
      const template = await TimetableTemplate.findOne({ day: dayName });
      
      if (template) {
        const newTasks = template.tasks.map(t => ({
          userId,
          date,
          day: dayName,
          taskId: t.taskId,
          taskName: t.taskName,
          subject: t.subject,
          startTime: t.startTime,
          endTime: t.endTime,
          completed: false,
          isCustom: false,
          notes: '',
          description: '',
          whatLearned: '',
          problemsFaced: '',
          timeSpent: ''
        }));
        
        tasks = await Task.insertMany(newTasks);
      }
    }
    
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST /api/tasks/:id/complete
// Toggles the completion status of a task
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();
    
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST /api/tasks
// Add a custom task
router.post('/', auth, async (req, res) => {
  try {
    const { date, day, taskName, subject, startTime, endTime, description, notes } = req.body;
    const userId = req.user.id;
    const taskId = `custom-${Date.now()}`;
    
    const newTask = new Task({
      userId,
      date,
      day: day || daysMap[getDay(parseISO(date))],
      taskId,
      taskName,
      subject: subject || 'Routine',
      startTime,
      endTime,
      description: description || '',
      notes: notes || '',
      isCustom: true
    });
    
    await newTask.save();
    res.json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// PUT /api/tasks/:id
// Update task details (notes, whatLearned, problemsFaced, timeSpent, description, etc.)
router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      notes, 
      whatLearned, 
      problemsFaced, 
      timeSpent, 
      description, 
      taskName, 
      startTime, 
      endTime, 
      subject 
    } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        notes,
        whatLearned,
        problemsFaced,
        timeSpent,
        description,
        ...(taskName && { taskName }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(subject && { subject })
      },
      { new: true }
    );
    
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE /api/tasks/:id
// Delete a custom task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (!task.isCustom) return res.status(400).json({ error: 'Cannot delete default template tasks' });
    
    await task.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
