const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { format, subDays, parseISO, differenceInCalendarDays } = require('date-fns');

// GET /api/progress/weekly
// Returns progress for main subjects for the current week
router.get('/weekly', async (req, res) => {
  try {
    const userId = 'demo-user';
    const { startDate, endDate } = req.query; // YYYY-MM-DD
    
    // Find tasks in this date range
    const tasks = await Task.find({ 
      userId, 
      date: { $gte: startDate, $lte: endDate } 
    });
    
    // Main subjects as requested in requirements 8 & 9
    const subjectTargets = {
      'Aptitude': 10,
      'English Communication': 7,
      'Web Development': 15,
      'Data Analytics': 15
    };

    const calculateDuration = (start, end) => {
      try {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let diff = (eh + em / 60) - (sh + sm / 60);
        if (diff < 0) diff += 24; // Handle past midnight
        return Math.max(diff, 0.5);
      } catch {
        return 1.0;
      }
    };

    const subjectProgress = {};
    Object.keys(subjectTargets).forEach(sub => {
      subjectProgress[sub] = {
        totalTasks: 0,
        completedTasks: 0,
        scheduledHours: 0,
        targetHours: subjectTargets[sub],
        completedHours: 0,
        pendingHours: subjectTargets[sub],
        completionPercentage: 0
      };
    });

    let totalScheduledHours = 0;
    let totalCompletedHours = 0;

    tasks.forEach(task => {
      const duration = calculateDuration(task.startTime, task.endTime);
      totalScheduledHours += duration;
      if (task.completed) totalCompletedHours += duration;

      if (subjectProgress[task.subject]) {
        subjectProgress[task.subject].totalTasks += 1;
        subjectProgress[task.subject].scheduledHours += duration;
        if (task.completed) {
          subjectProgress[task.subject].completedTasks += 1;
          subjectProgress[task.subject].completedHours += duration;
        }
      }
    });

    // Finalize pending hours and percentages
    Object.keys(subjectProgress).forEach(sub => {
      const sp = subjectProgress[sub];
      // Target is whichever is greater: minimum weekly goal or scheduled hours
      const effectiveTarget = Math.max(sp.targetHours, Math.round(sp.scheduledHours * 10) / 10);
      sp.targetHours = effectiveTarget;
      sp.completedHours = Math.round(sp.completedHours * 10) / 10;
      sp.pendingHours = Math.max(0, Math.round((sp.targetHours - sp.completedHours) * 10) / 10);
      sp.completionPercentage = sp.targetHours > 0 
        ? Math.min(100, Math.round((sp.completedHours / sp.targetHours) * 100)) 
        : 0;
    });

    const totalTarget = Object.values(subjectProgress).reduce((acc, curr) => acc + curr.targetHours, 0);
    const totalCompleted = Object.values(subjectProgress).reduce((acc, curr) => acc + curr.completedHours, 0);
    const totalWeeklyCompletion = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

    res.json({
      subjects: subjectProgress,
      totalWeeklyCompletion,
      totalCompletedHours: Math.round(totalCompleted * 10) / 10,
      totalTargetHours: Math.round(totalTarget * 10) / 10
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/progress/history
// Returns daily completion percentage for calendar
router.get('/history', async (req, res) => {
  try {
    const userId = 'demo-user';
    const tasks = await Task.find({ userId });
    
    const history = {};
    tasks.forEach(task => {
      if (!history[task.date]) {
        history[task.date] = { total: 0, completed: 0 };
      }
      history[task.date].total += 1;
      if (task.completed) {
        history[task.date].completed += 1;
      }
    });
    
    const calendarData = Object.keys(history).map(date => {
      const dayData = history[date];
      const percentage = dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0;
      return {
        date,
        total: dayData.total,
        completed: dayData.completed,
        pending: dayData.total - dayData.completed,
        percentage
      };
    });
    
    res.json(calendarData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/progress/streak
// Calculates streak: If user completes at least 70% of day's tasks, counts as successful
router.get('/streak', async (req, res) => {
  try {
    const userId = 'demo-user';
    const tasks = await Task.find({ userId });

    const dayMap = {};
    tasks.forEach(t => {
      if (!dayMap[t.date]) dayMap[t.date] = { total: 0, completed: 0 };
      dayMap[t.date].total += 1;
      if (t.completed) dayMap[t.date].completed += 1;
    });

    const successfulDates = Object.keys(dayMap).filter(date => {
      const { total, completed } = dayMap[date];
      return total > 0 && (completed / total) >= 0.7; // 70% requirement
    }).sort();

    const daysCompleted = successfulDates.length;

    // Calculate longest and current streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const dStr of successfulDates) {
      const curDate = parseISO(dStr);
      if (prevDate) {
        const diff = differenceInCalendarDays(curDate, prevDate);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevDate = curDate;
    }

    // Calculate current streak ending today or yesterday
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check if today is successful, else check if yesterday was successful
    let checkStr = format(checkDate, 'yyyy-MM-dd');
    if (!successfulDates.includes(checkStr)) {
      checkDate = subDays(checkDate, 1);
      checkStr = format(checkDate, 'yyyy-MM-dd');
    }

    while (successfulDates.includes(checkStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
      checkStr = format(checkDate, 'yyyy-MM-dd');
    }

    res.json({
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      daysCompleted,
      successfulDates
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
