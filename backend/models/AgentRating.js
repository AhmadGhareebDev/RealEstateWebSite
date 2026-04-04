const mongoose = require('mongoose');

const agentRatingSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, { timestamps: true });

agentRatingSchema.index({ reviewer: 1, agent: 1 }, { unique: true });
agentRatingSchema.index({ agent: 1, rating: -1 });

module.exports = mongoose.model('AgentRating', agentRatingSchema);