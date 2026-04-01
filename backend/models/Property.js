const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title:       { type: String, required: true },
  price:       { type: Number, required: true },
  location:    { type: String, required: true },
  bedrooms:    { type: Number, required: true },
  bathrooms:   { type: Number, required: true },
  area:        { type: Number, required: true },
  images:      [{ type: String }],
  description: { type: String, required: true },
  type:        { type: String, enum: ['sale', 'rent'], required: true },

  listingType: {
    type: String,
    enum: ['fsbo', 'agent'],
    required: true
  },

  listedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isShowcase: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['active', 'sold', 'rented', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

propertySchema.index({ location: 'text' });

propertySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'property'
});

propertySchema.virtual('averageRating').get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((total, r) => total + (r.rating || 0), 0);
  return Number((sum / this.reviews.length).toFixed(1));
});

propertySchema.virtual('reviewCount').get(function () {
  return this.reviews ? this.reviews.length : 0;
});

module.exports = mongoose.model('Property', propertySchema);