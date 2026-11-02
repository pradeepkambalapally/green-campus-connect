const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
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
}, {
  timestamps: true,
});

challengeSchema.index({ category: 1 });
challengeSchema.index({ endDate: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
