const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

reviewSchema.index({ reviewer: 1, property: 1 }, { 
  unique: true, 
  partialFilterExpression: { property: { $ne: null } } 
});

reviewSchema.index({ reviewer: 1, agent: 1 }, { 
  unique: true, 
  partialFilterExpression: { agent: { $ne: null } } 
});

reviewSchema.pre('save', function(next) {
  const hasProperty = this.property !== null && this.property !== undefined;
  const hasAgent = this.agent !== null && this.agent !== undefined;

  if (hasProperty && hasAgent) {
    return next(new Error('Review cannot target both property and agent'));
  }
  if (!hasProperty && !hasAgent) {
    return next(new Error('Review must target either a property or an agent'));
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);