const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  completedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningModule',
  }],
  streak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: [300, 'Bio cannot exceed 300 characters'],
    default: '',
  },
  department: {
    type: String,
    trim: true,
    default: '',
  },
  yearOfStudy: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level from XP
userSchema.methods.calculateLevel = function () {
  // Every 500 XP = 1 level
  this.level = Math.floor(this.xp / 500) + 1;
  return this.level;
};

module.exports = mongoose.model('User', userSchema);
