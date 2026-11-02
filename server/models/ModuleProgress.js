const mongoose = require('mongoose');

const moduleProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningModule',
    required: true,
  },
  currentSection: {
    type: Number,
    default: 0,
  },
  completedSections: [{
    type: Number,
  }],
  readingCompleted: {
    type: Boolean,
    default: false,
  },
  quizCompleted: {
    type: Boolean,
    default: false,
  },
  quizScore: {
    type: Number,
    default: 0,
  },
  quizPercentage: {
    type: Number,
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  xpAwarded: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure one progress record per user and module
moduleProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('ModuleProgress', moduleProgressSchema);
