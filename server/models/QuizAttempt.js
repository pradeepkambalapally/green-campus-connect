const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
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
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean,
  }],
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index to find attempts by user and module
quizAttemptSchema.index({ userId: 1, moduleId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
