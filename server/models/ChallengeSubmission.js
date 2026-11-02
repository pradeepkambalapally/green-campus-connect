const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Submission description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Evidence image is required'],
  },
  imagePublicId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectReason: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  xpAwarded: {
    type: Number,
    default: 0,
  },
  resubmissionCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

challengeSubmissionSchema.index({ userId: 1, challengeId: 1 });
challengeSubmissionSchema.index({ status: 1 });

module.exports = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);
