const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true

    },
    location: {
        type: String
    },
    phone: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['buyer' , 'seller' , 'admin'],
        default: 'buyer'
    },
    createdAt: {
    type: Date,
    default: Date.now
  }
    
})


userSchema.pre("save", async function (next){
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password , 10);
    next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);