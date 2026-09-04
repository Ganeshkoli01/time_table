require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const taskRoutes = require('./routes/tasks');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cached MongoDB Connection for Serverless & Standalone
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement-tracker';
  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState >= 1;
    console.log('MongoDB connected successfully');
    
    // Seed Admin User
    try {
      const adminEmail = 'ganeshkoli80.9527@gmail.com';
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456789', salt);
        await User.create({
          name: 'gkoli',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        });
        console.log('Admin user seeded successfully');
      }
    } catch (seedErr) {
      console.error('Error seeding admin user:', seedErr.message);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Service Unavailable: Database connection failed. Please ensure MongoDB is running.' });
  }
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState >= 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV || 'development'
  });
});

// Only listen on port if not running as a Vercel serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
