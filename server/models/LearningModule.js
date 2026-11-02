const mongoose = require('mongoose');

const learningModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    enum: [
      'Forest of Waste Wisdom',
      'Water World',
      'Energy Valley',
      'Green Mobility Trail',
      'Eco Living Island',
    ],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  topics: [{
    type: String,
  }],
  xpReward: {
    type: Number,
    default: 100,
  },
  order: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    default: '🌿',
  },
  quizQuestions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, default: '' },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

learningModuleSchema.index({ destination: 1, order: 1 });

module.exports = mongoose.model('LearningModule', learningModuleSchema);
