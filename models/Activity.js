const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['user_signup', 'resume_upload', 'question_answered', 'support_message', 'profile_update']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
activitySchema.index({ timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });
activitySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema); 