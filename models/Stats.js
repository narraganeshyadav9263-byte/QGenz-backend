const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  totalResumesUploaded: {
    type: Number,
    default: 0
  },
  totalQuestionsGenerated: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one stats document exists
statsSchema.statics.getStats = async function() {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({});
  }
  return stats;
};

module.exports = mongoose.model('Stats', statsSchema); 