const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User model with roles: user and agent
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  location: { type: String, required: true },

  // User role (assigned at signup)
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
  isEmailVerified: { type: Boolean, default: false },

  // Agent-only fields
  licenseNumber: { type: String },
  licenseState: { type: String },
  brokerage: { type: String },
  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual reviews relationship
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