const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Challenge = require('../models/Challenge');
const ActivityLog = require('../models/ActivityLog');

// @route   POST /api/submissions
// @desc    Submit evidence for a challenge
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { challengeId, description, imageUrl } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check if already submitted
    const existing = await ChallengeSubmission.findOne({
      userId: req.user.id,
      challengeId,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already submitted evidence for this challenge' });
    }

    // Check if joined
    if (!challenge.participants.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You must join the challenge first' });
    }

    const submission = await ChallengeSubmission.create({
      userId: req.user.id,
      challengeId,
      description,
      imageUrl,
    });

    await ActivityLog.create({
      userId: req.user.id,
      type: 'challenge_submitted',
      description: `Submitted evidence for: ${challenge.title}`,
      metadata: { challengeId, submissionId: submission._id },
    });

    res.status(201).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
