const mongoose = require('mongoose');

const timetableTemplateSchema = new mongoose.Schema({
  day: { type: String, required: true, unique: true }, // Monday, Tuesday, etc.
  tasks: [{
    taskId: { type: String, required: true },
    taskName: { type: String, required: true },
    subject: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }]
});

module.exports = mongoose.model('TimetableTemplate', timetableTemplateSchema);
