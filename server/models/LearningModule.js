const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  sectionNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  campusExample: {
    type: String,
    default: '',
  },
  keyTakeaway: {
    type: String,
    default: '',
  },
});

const learningModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
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
  topic: {
    type: String,
    default: 'Sustainability',
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  learningObjectives: [{
    type: String,
  }],
  estimatedReadingTime: {
    type: String,
    default: '5 mins',
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  topics: [{
    type: String,
  }],
  sections: [sectionSchema],
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
learningModuleSchema.index({ slug: 1 });

module.exports = mongoose.model('LearningModule', learningModuleSchema);
