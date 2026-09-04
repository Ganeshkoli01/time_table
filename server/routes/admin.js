const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Task = require('../models/Task');

// Apply auth and adminAuth to all routes in this file
router.use(auth);
router.use(adminAuth);

// GET /api/admin/stats
// Get global application statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Aggregation for total tasks and completion rate
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] }
          }
        }
      }
    ]);

    let totalTasks = 0;
    let completedTasks = 0;
    
    if (taskStats.length > 0) {
      totalTasks = taskStats[0].totalTasks;
      completedTasks = taskStats[0].completedTasks;
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      completionRate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

const { format, subDays, parseISO, differenceInCalendarDays } = require('date-fns');

// GET /api/admin/users
// Get list of all students with their streaks
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    
    // Compute actual streak for each user
    const usersWithStreaks = await Promise.all(users.map(async (u) => {
      const tasks = await Task.find({ userId: u._id });
      const dayMap = {};
      tasks.forEach(t => {
        if (!dayMap[t.date]) dayMap[t.date] = { total: 0, completed: 0 };
        dayMap[t.date].total += 1;
        if (t.completed) dayMap[t.date].completed += 1;
      });

      const successfulDates = Object.keys(dayMap).filter(date => {
        const { total, completed } = dayMap[date];
        return total > 0 && (completed / total) >= 0.7;
      }).sort();

      let longestStreak = 0;
      let tempStreak = 0;
      let prevDate = null;

      for (const dStr of successfulDates) {
        const curDate = parseISO(dStr);
        if (prevDate) {
          const diff = differenceInCalendarDays(curDate, prevDate);
          if (diff === 1) tempStreak++;
          else tempStreak = 1;
        } else {
          tempStreak = 1;
        }
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        prevDate = curDate;
      }

      let currentStreak = 0;
      let checkDate = new Date();
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

      const finalLongest = Math.max(longestStreak, currentStreak);
      
      return {
        ...u.toObject(),
        currentStreak,
        longestStreak: finalLongest
      };
    }));

    res.json(usersWithStreaks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
