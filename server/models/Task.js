const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo-user' },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  day: { type: String, required: true }, // Monday, Tuesday...
  taskId: { type: String, required: true }, // unique string from template or custom
  taskName: { type: String, required: true },
  subject: { type: String, required: true },
  startTime: { type: String, required: true }, // HH:mm format (24h or 12h, will keep consistent)
  endTime: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  notes: { type: String, default: '' },
  description: { type: String, default: '' },
  whatLearned: { type: String, default: '' },
  problemsFaced: { type: String, default: '' },
  timeSpent: { type: String, default: '' },
  isCustom: { type: Boolean, default: false }
});

// Compound index to ensure uniqueness for a given user, date, and task
taskSchema.index({ userId: 1, date: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model('Task', taskSchema);
