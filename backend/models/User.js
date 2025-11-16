const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  email: { type: String, required: true, unique: true, lowercase: true },
  location: String,
  phone: String,
  profileImage: String,
  role: { type: String, enum: ['buyer', 'agent', 'admin'], required: true },
  refreshToken: String,
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('reviews' , {
  ref: 'Review',
  localField: '_id',
  foreignField: 'agent'
})

userSchema.virtual('averageRating').get(function() {
  if(!this.reviews || this.reviews.length === 0) {
    return 0
  }
  const sum = this.reviews.reduce((total , r) => total + r.rating , 0)
  return Number((sum / this.reviews.length).toFixed(1));  
})

userSchema.virtual('reviewCount').get(function () {
  return this.reviews ? this.reviews.length : 0;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });


module.exports = mongoose.model('User', userSchema);