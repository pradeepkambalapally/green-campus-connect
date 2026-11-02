const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  criteria: {
    type: String,
    required: true,
  },
  criteriaType: {
    type: String,
    enum: ['module_complete', 'challenge_complete', 'xp_threshold', 'streak', 'special'],
    required: true,
  },
  criteriaValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Badge', badgeSchema);
