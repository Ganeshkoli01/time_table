const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // req.user is set by the previous auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authorization denied' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    next();
  } catch (err) {
    console.error('Admin Auth Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = adminAuth;
