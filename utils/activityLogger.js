const Activity = require('../models/Activity');

const logActivity = async (type, userId, details, metadata = {}) => {
  try {
    const activity = new Activity({
      type,
      user: userId,
      details,
      metadata,
      timestamp: new Date()
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw the error to prevent disrupting the main flow
    return null;
  }
};

module.exports = { logActivity }; 