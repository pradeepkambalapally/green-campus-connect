const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  whyItMatters: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
    enum: ['waste', 'water', 'energy', 'mobility', 'lifestyle'],
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
  },
  rewardXP: {
    type: Number,
    required: true,
    default: 50,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  instructions: {
    type: String,
    required: true,
  },
  evidenceRequirements: {
    type: String,
    required: true,
  },
  submissionRules: {
    type: String,
    default: 'Submit an authentic, original photograph captured on campus grounds showing the required sustainable activity. Clear lighting and visibility required.',
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  icon: {
    type: String,
    default: '🌱',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

challengeSchema.index({ category: 1 });
challengeSchema.index({ endDate: 1 });
challengeSchema.index({ slug: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
