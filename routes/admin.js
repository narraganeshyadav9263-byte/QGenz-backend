const express = require('express');
const router = express.Router();
const User = require('../models/User');
const moment = require('moment');
const Resume = require('../models/Resume');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');

const SUPER_ADMIN_CREDENTIALS = {
  email: 'adepuaravind128@gmail.com',
  password: 'admin123'
};

// Dashboard stats
router.get('/stats', async (req, res) => {
  res.json({
    totalUsers: 5,
    totalResumes: 7,
    activeUsers: 3,
    totalQuestions: 33,
    averageRating: 4.5
  });
});

// User growth analytics
router.get('/analytics/users/growth', async (req, res) => {
  try {
    // Get the last 6 months
    const months = [];
    const now = moment().startOf('month');
    for (let i = 5; i >= 0; i--) {
      months.push(now.clone().subtract(i, 'months'));
    }

    // Aggregate user registrations per month
    const start = months[0].toDate();
    const users = await User.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Map results to month labels and data
    const userCounts = {};
    users.forEach(u => { userCounts[u._id] = u.count; });
    const labels = months.map(m => m.format('MMM YYYY'));
    const keys = months.map(m => m.format('YYYY-MM'));
    const data = keys.map(k => userCounts[k] || 0);

    res.json({ labels, data });
  } catch (err) {
    console.error('Error fetching user growth:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Resume uploads analytics
router.get('/analytics/resumes/uploads', async (req, res) => {
  try {
    // Get the last 6 months
    const months = [];
    const now = moment().startOf('month');
    for (let i = 5; i >= 0; i--) {
      months.push(now.clone().subtract(i, 'months'));
    }

    // Aggregate resume uploads per month
    const start = months[0].toDate();
    const resumes = await Resume.aggregate([
      { $match: { uploadDate: { $gte: start }, status: 'active' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$uploadDate' } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Map results to month labels and data
    const resumeCounts = {};
    resumes.forEach(r => { resumeCounts[r._id] = r.count; });
    const labels = months.map(m => m.format('MMM YYYY'));
    const keys = months.map(m => m.format('YYYY-MM'));
    const data = keys.map(k => resumeCounts[k] || 0);

    res.json({ labels, data });
  } catch (err) {
    console.error('Error fetching resume uploads:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Recent activity
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .lean();

    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      type: activity.type,
      user: activity.user.name,
      email: activity.user.email,
      details: activity.details,
      timestamp: activity.timestamp,
      metadata: activity.metadata
    }));

    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent activity' 
    });
  }
});

// System health
router.get('/system/health', async (req, res) => {
  res.json({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '120ms',
    activeConnections: 150,
    lastChecked: new Date()
  });
});

// Admin login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials
    if (email === SUPER_ADMIN_CREDENTIALS.email && password === SUPER_ADMIN_CREDENTIALS.password) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          email,
          isAdmin: true 
        },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          email,
          isAdmin: true
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    });
  }
});

// Verify admin token
router.get('/auth/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router; 