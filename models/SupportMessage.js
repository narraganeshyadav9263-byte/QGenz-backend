const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['unresolved', 'resolved'],
    default: 'unresolved'
  },
  reply: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('SupportMessage', supportMessageSchema); 