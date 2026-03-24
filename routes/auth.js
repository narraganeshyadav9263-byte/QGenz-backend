const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Stats = require('../models/Stats');
const { logActivity } = require('../utils/activityLogger');
const { sendPasswordResetEmail, sendPasswordResetOTP } = require('../utils/emailService');
const router = express.Router();

// JWT Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');
  console.log('Auth Header:', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token);
  console.log('JWT_SECRET from .env:', process.env.JWT_SECRET);
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Invalid token' });
  }
}

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Log activity
    await logActivity('user_signup', newUser._id, `${name} created a new account`);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users (admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a user by ID (admin)
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add a new user (admin)
router.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Name, email, and password are required' });
  }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    // Hash the password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ msg: 'User created', user: { _id: newUser._id, name, email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get total user count (admin)
router.get('/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ total: count });
  } catch (err) {
    console.error('Error getting user count:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get total resume count (admin)
router.get('/resumes/count', async (req, res) => {
  try {
    const count = await Resume.countDocuments({ status: 'active' });
    res.json({ total: count });
  } catch (err) {
    console.error('Error getting resume count:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload resume
router.post('/resumes/upload', authMiddleware, async (req, res) => {
  try {
    const { fileName, filePath } = req.body;
    if (!fileName || !filePath) {
      return res.status(400).json({ msg: 'File name and path are required' });
    }

    const newResume = new Resume({
      userId: req.user.id,
      fileName,
      filePath
    });

    await newResume.save();

    // Log activity
    await logActivity('resume_upload', req.user.id, `Uploaded resume: ${fileName}`, {
      fileName,
      filePath
    });

    res.status(201).json({ msg: 'Resume uploaded successfully', resume: newResume });
  } catch (err) {
    console.error('Error uploading resume:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's resumes
router.get('/resumes', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id, status: 'active' });
    res.json(resumes);
  } catch (err) {
    console.error('Error fetching resumes:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete resume
router.delete('/resumes/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    resume.status = 'deleted';
    await resume.save();
    res.json({ msg: 'Resume deleted successfully' });
  } catch (err) {
    console.error('Error deleting resume:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all stats
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching stats...');
    const stats = await Stats.getStats();
    console.log('Stats found:', stats);
    res.json({
      totalResumesUploaded: stats.totalResumesUploaded,
      totalQuestionsGenerated: stats.totalQuestionsGenerated,
      lastUpdated: stats.lastUpdated
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Increment resume upload count
router.post('/stats/resume-uploaded', async (req, res) => {
  try {
    console.log('Incrementing resume upload count...');
    const stats = await Stats.getStats();
    console.log('Current stats:', stats);
    stats.totalResumesUploaded += 1;
    stats.lastUpdated = new Date();
    await stats.save();
    console.log('Updated stats:', stats);
    res.json({ msg: 'Resume upload counted', total: stats.totalResumesUploaded });
  } catch (err) {
    console.error('Error updating resume count:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Increment questions generated count
router.post('/stats/questions-generated', async (req, res) => {
  try {
    const stats = await Stats.getStats();
    const count = Number(req.body.count) || 1; // Default to 1 if not provided
    stats.totalQuestionsGenerated += count;
    stats.lastUpdated = new Date();
    await stats.save();
    res.json({ msg: 'Questions generated counted', total: stats.totalQuestionsGenerated });
  } catch (err) {
    console.error('Error updating questions count:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ valid: false });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.json({ valid: false });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.json({ msg: 'If an account exists with this email, you will receive password reset instructions.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in user document
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 600000; // 10 minutes
    user.otpAttempts = 0;
    user.lastOtpAttempt = Date.now();
    await user.save();

    // Send OTP email
    await sendPasswordResetOTP(email, otp);

    res.json({ msg: 'If an account exists with this email, you will receive password reset instructions.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      resetOTP: otp,
      resetOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    // Generate temporary token for password reset
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({ 
      msg: 'OTP verified successfully',
      resetToken 
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ msg: 'Invalid reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password and clear OTP
    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    user.otpAttempts = 0;
    user.lastOtpAttempt = undefined;
    await user.save();

    res.json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = {
  router,
  authMiddleware,
};