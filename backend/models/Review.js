const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',           
    required: true
  },

  
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ agent: 1, buyer: 1 }, { unique: true });

reviewSchema.index({ agent: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);