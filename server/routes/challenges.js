const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');

// @route   GET /api/challenges
// @desc    Get all active challenges
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const challenges = await Challenge.find({ isActive: true }).sort('-createdAt');

    // Add participation status per user
    const submissions = await ChallengeSubmission.find({ userId: req.user.id });
    const challengesWithStatus = challenges.map(ch => {
      const joined = ch.participants.includes(req.user.id);
      const submission = submissions.find(s => s.challengeId.toString() === ch._id.toString());
      return {
        ...ch.toObject(),
        hasJoined: joined,
        submissionStatus: submission ? submission.status : null,
      };
    });

    res.json({ success: true, challenges: challengesWithStatus });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/challenges/:id
// @desc    Get single challenge
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const submission = await ChallengeSubmission.findOne({
      userId: req.user.id,
      challengeId: challenge._id,
    });

    res.json({
      success: true,
      challenge: {
        ...challenge.toObject(),
        hasJoined: challenge.participants.includes(req.user.id),
        submission: submission || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/challenges/:id/join
// @desc    Join a challenge
// @access  Private
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (challenge.participants.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already joined this challenge' });
    }

    challenge.participants.push(req.user.id);
    await challenge.save();

    res.json({ success: true, message: 'Successfully joined the challenge!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
