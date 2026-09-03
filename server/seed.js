require('dotenv').config();
const mongoose = require('mongoose');
const TimetableTemplate = require('./models/TimetableTemplate');

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const scheduleData = {
  Monday: [
    { taskName: 'Wake up + freshen up', subject: 'Routine', startTime: '06:00', endTime: '06:30' },
    { taskName: 'Aptitude', subject: 'Aptitude', startTime: '06:30', endTime: '07:30' },
    { taskName: 'Breakfast + get ready', subject: 'Routine', startTime: '07:30', endTime: '08:30' },
    { taskName: 'College', subject: 'College', startTime: '08:30', endTime: '15:30' },
    { taskName: 'Travel + snacks + rest', subject: 'Routine', startTime: '15:30', endTime: '17:00' },
    { taskName: 'Web Development', subject: 'Web Development', startTime: '17:00', endTime: '19:00' },
    { taskName: 'Break', subject: 'Routine', startTime: '19:00', endTime: '19:30' },
    { taskName: 'Data Analytics', subject: 'Data Analytics', startTime: '19:30', endTime: '20:30' },
    { taskName: 'Dinner + rest', subject: 'Routine', startTime: '20:30', endTime: '21:30' },
    { taskName: 'English Communication', subject: 'English Communication', startTime: '21:30', endTime: '22:30' },
    { taskName: 'Revision', subject: 'Revision', startTime: '22:30', endTime: '23:00' },
    { taskName: 'Sleep', subject: 'Routine', startTime: '23:00', endTime: '06:00' }
  ],
  Tuesday: [
    { taskName: 'Wake up + freshen up', subject: 'Routine', startTime: '06:00', endTime: '06:30' },
    { taskName: 'Aptitude', subject: 'Aptitude', startTime: '06:30', endTime: '07:30' },
    { taskName: 'Breakfast + preparation', subject: 'Routine', startTime: '07:30', endTime: '08:30' },
    { taskName: 'Lectures', subject: 'College', startTime: '08:30', endTime: '10:30' },
    { taskName: 'Data Analytics', subject: 'Data Analytics', startTime: '10:30', endTime: '12:00' },
    { taskName: 'Break', subject: 'Routine', startTime: '12:00', endTime: '12:30' },
    { taskName: 'Lunch', subject: 'Routine', startTime: '12:30', endTime: '13:30' },
    { taskName: 'Lectures', subject: 'College', startTime: '13:30', endTime: '15:30' },
    { taskName: 'Travel + rest', subject: 'Routine', startTime: '15:30', endTime: '17:00' },
    { taskName: 'Web Development', subject: 'Web Development', startTime: '17:00', endTime: '19:00' },
    { taskName: 'Break', subject: 'Routine', startTime: '19:00', endTime: '19:30' },
    { taskName: 'English Communication', subject: 'English Communication', startTime: '19:30', endTime: '20:30' },
    { taskName: 'Dinner + rest', subject: 'Routine', startTime: '20:30', endTime: '21:30' },
    { taskName: 'Data Analytics Practice', subject: 'Data Analytics', startTime: '21:30', endTime: '22:30' },
    { taskName: 'Revision', subject: 'Revision', startTime: '22:30', endTime: '23:00' },
    { taskName: 'Sleep', subject: 'Routine', startTime: '23:00', endTime: '06:00' }
  ],
  Wednesday: [
    { taskName: 'Wake up', subject: 'Routine', startTime: '06:00', endTime: '06:30' },
    { taskName: 'Aptitude', subject: 'Aptitude', startTime: '06:30', endTime: '07:30' },
    { taskName: 'Breakfast + preparation', subject: 'Routine', startTime: '07:30', endTime: '08:30' },
    { taskName: 'English Communication', subject: 'English Communication', startTime: '08:30', endTime: '09:30' },
    { taskName: 'Data Analytics', subject: 'Data Analytics', startTime: '09:30', endTime: '11:00' },
    { taskName: 'Lectures', subject: 'College', startTime: '11:00', endTime: '12:30' },
    { taskName: 'Lunch + break', subject: 'Routine', startTime: '12:30', endTime: '13:30' },
    { taskName: 'Lectures', subject: 'College', startTime: '13:30', endTime: '15:30' },
    { taskName: 'Travel + rest', subject: 'Routine', startTime: '15:30', endTime: '17:00' },
    { taskName: 'Web Development', subject: 'Web Development', startTime: '17:00', endTime: '19:00' },
    { taskName: 'Break', subject: 'Routine', startTime: '19:00', endTime: '19:30' },
    { taskName: 'Data Analytics', subject: 'Data Analytics', startTime: '19:30', endTime: '20:30' },
    { taskName: 'Dinner', subject: 'Routine', startTime: '20:30', endTime: '21:30' },
    { taskName: 'English + Interview Speaking', subject: 'English Communication', startTime: '21:30', endTime: '22:30' },
    { taskName: 'Revision', subject: 'Revision', startTime: '22:30', endTime: '23:00' },
    { taskName: 'Sleep', subject: 'Routine', startTime: '23:00', endTime: '06:00' }
  ],
  Thursday: [
    { taskName: 'Wake up', subject: 'Routine', startTime: '06:00', endTime: '06:30' },
    { taskName: 'Aptitude', subject: 'Aptitude', startTime: '06:30', endTime: '07:30' },
    { taskName: 'Breakfast + preparation', subject: 'Routine', startTime: '07:30', endTime: '08:30' },
    { taskName: 'College', subject: 'College', startTime: '08:30', endTime: '13:30' },
    { taskName: 'Lunch/rest', subject: 'Routine', startTime: '13:30', endTime: '15:00' },
    { taskName: 'Web Development', subject: 'Web Development', startTime: '15:00', endTime: '17:30' },
    { taskName: 'Break', subject: 'Routine', startTime: '17:30', endTime: '18:00' },
    { taskName: 'Data Analytics', subject: 'Data Analytics', startTime: '18:00', endTime: '20:00' },
    { taskName: 'Dinner + rest', subject: 'Routine', startTime: '20:00', endTime: '21:00' },
    { taskName: 'English Communication', subject: 'English Communication', startTime: '21:00', endTime: '22:00' },
    { taskName: 'Aptitude Revision/Test', subject: 'Aptitude', startTime: '22:00', endTime: '22:30' },
    { taskName: 'Revision', subject: 'Revision', startTime: '22:30', endTime: '23:00' },
    { taskName: 'Sleep', subject: 'Routine', startTime: '23:00', endTime: '06:00' }
  ],
  Friday: [
    { taskName: 'Wake up + exercise', subject: 'Routine', startTime: '06:00', endTime: '07:00' },
    { taskName: 'Aptitude (Concepts + Problems)', subject: 'Aptitude', startTime: '07:00', endTime: '08:30' },
    { taskName: 'Breakfast', subject: 'Routine', startTime: '08:30', endTime: '09:00' },
    { taskName: 'Web Development', subject: 'Web Development', startTime: '09:00', endTime: '11:00' },
    { taskName: 'Break', subject: 'Routine', startTime: '11:00', endTime: '11:30' },
    { taskName: 'Data Analytics', subject: 'Data Analytics', startTime: '11:30', endTime: '13:30' },
    { taskName: 'Lunch + rest', subject: 'Routine', startTime: '13:30', endTime: '14:30' },
    { taskName: 'English Communication', subject: 'English Communication', startTime: '14:30', endTime: '15:30' },
    { taskName: 'Break', subject: 'Routine', startTime: '15:30', endTime: '16:00' },
    { taskName: 'Web Development Project', subject: 'Web Development', startTime: '16:00', endTime: '18:00' },
    { taskName: 'Exercise / break', subject: 'Routine', startTime: '18:00', endTime: '19:00' },
    { taskName: 'SQL / Data Analytics Practice', subject: 'Data Analytics', startTime: '19:00', endTime: '20:30' },
    { taskName: 'Dinner', subject: 'Routine', startTime: '20:30', endTime: '21:30' },
    { taskName: 'Aptitude Mock Test', subject: 'Aptitude', startTime: '21:30', endTime: '22:30' },
    { taskName: 'Sleep', subject: 'Routine', startTime: '22:30', endTime: '06:00' }
  ],
  Saturday: [
    { taskName: 'Wake up + exercise', subject: 'Routine', startTime: '06:00', endTime: '07:00' },
    { taskName: 'Aptitude Mock Test + Analysis', subject: 'Aptitude', startTime: '07:00', endTime: '09:00' },
    { taskName: 'Breakfast', subject: 'Routine', startTime: '09:00', endTime: '09:30' },
    { taskName: 'Web Development Project', subject: 'Web Development', startTime: '09:30', endTime: '12:30' },
    { taskName: 'Break', subject: 'Routine', startTime: '12:30', endTime: '13:00' },
    { taskName: 'Data Analytics Project', subject: 'Data Analytics', startTime: '13:00', endTime: '14:30' },
    { taskName: 'Lunch + rest', subject: 'Routine', startTime: '14:30', endTime: '15:30' },
    { taskName: 'English Speaking Practice', subject: 'English Communication', startTime: '15:30', endTime: '16:30' },
    { taskName: 'Break / exercise', subject: 'Routine', startTime: '16:30', endTime: '17:30' },
    { taskName: 'Web Development', subject: 'Web Development', startTime: '17:30', endTime: '19:30' },
    { taskName: 'Dinner', subject: 'Routine', startTime: '19:30', endTime: '20:30' },
    { taskName: 'SQL / Python / Pandas Practice', subject: 'Data Analytics', startTime: '20:30', endTime: '21:30' },
    { taskName: 'HR Interview Questions', subject: 'Interview Prep', startTime: '21:30', endTime: '22:30' },
    { taskName: 'Weekly Revision', subject: 'Revision', startTime: '22:30', endTime: '23:30' },
    { taskName: 'Sleep', subject: 'Routine', startTime: '23:30', endTime: '06:00' }
  ],
  Sunday: [
    { taskName: 'Wake up + exercise', subject: 'Routine', startTime: '06:00', endTime: '07:00' },
    { taskName: 'Full Aptitude Mock Test', subject: 'Aptitude', startTime: '07:00', endTime: '09:00' },
    { taskName: 'Breakfast', subject: 'Routine', startTime: '09:00', endTime: '09:30' },
    { taskName: 'Data Analytics', subject: 'Data Analytics', startTime: '09:30', endTime: '12:30' },
    { taskName: 'Break', subject: 'Routine', startTime: '12:30', endTime: '13:00' },
    { taskName: 'Web Development Project', subject: 'Web Development', startTime: '13:00', endTime: '14:30' },
    { taskName: 'Lunch + rest', subject: 'Routine', startTime: '14:30', endTime: '15:30' },
    { taskName: 'English Speaking + Vocabulary', subject: 'English Communication', startTime: '15:30', endTime: '17:00' },
    { taskName: 'Break', subject: 'Routine', startTime: '17:00', endTime: '17:30' },
    { taskName: 'Mock Interview', subject: 'Interview Prep', startTime: '17:30', endTime: '19:00' },
    { taskName: 'Resume + LinkedIn/GitHub improvement', subject: 'Career', startTime: '19:00', endTime: '20:30' },
    { taskName: 'Dinner', subject: 'Routine', startTime: '20:30', endTime: '21:30' },
    { taskName: 'Weekly Revision', subject: 'Revision', startTime: '21:30', endTime: '22:30' },
    { taskName: 'Plan next week', subject: 'Planning', startTime: '22:30', endTime: '23:00' },
    { taskName: 'Sleep', subject: 'Routine', startTime: '23:00', endTime: '06:00' }
  ]
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement-tracker');
    console.log('MongoDB connected for seeding');

    await TimetableTemplate.deleteMany({});
    console.log('Cleared existing templates');

    const templates = [];
    for (const day of days) {
      const dayTasks = scheduleData[day].map((t, idx) => ({
        taskId: `${day.toLowerCase()}-${idx}`,
        ...t
      }));
      templates.push({
        day,
        tasks: dayTasks
      });
    }

    await TimetableTemplate.insertMany(templates);
    console.log('Successfully seeded timetable templates');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
