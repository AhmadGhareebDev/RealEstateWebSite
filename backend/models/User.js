const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  location: { type: String, required: true },

  role: {
    type: String,
    enum: ['user', 'agent'],
    default: 'user',
    required: true
  },

  profileImage: {
    type: String,
    default: ''
  },

  refreshToken: String,
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  passwordResetCode: String,
  passwordResetExpires: Date,
  isEmailVerified: { type: Boolean, default: false },

  licenseNumber: { type: String },
  licenseState: { type: String },
  brokerage: { type: String },
  isVerified: { type: Boolean, default: false },

  profileRatingAverage: { type: Number, default: 0, min: 0, max: 5 },
  profileRatingCount: { type: Number, default: 0, min: 0 },
  profileRatingScoreSum: { type: Number, default: 0, min: 0 },

  profileViewsTotal: { type: Number, default: 0, min: 0 },
  profileViewsUnique30d: { type: Number, default: 0, min: 0 },
  profileLastViewedAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ role: 1, profileRatingAverage: -1, profileRatingCount: -1, createdAt: -1 });
userSchema.index({role: 1 , profileViewsTotal: -1, profileLastViewedAt: -1});
userSchema.index({ role: 1, profileViewsUnique30d: -1, profileLastViewedAt: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'agent'
});

userSchema.virtual('favorite', {
  ref: 'Favorite',
  localField: '_id',
  foreignField: 'user'
});

userSchema.virtual('averageRating').get(function () {
  if (this.role !== 'agent') return 0;
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((total, r) => total + (r.rating || 0), 0);
  return Number((sum / this.reviews.length).toFixed(1));
});

userSchema.virtual('reviewCount').get(function () {
  if (this.role !== 'agent') return 0;
  return this.reviews ? this.reviews.length : 0;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);