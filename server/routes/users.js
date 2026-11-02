const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const UserBadge = require('../models/UserBadge');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/users/me/progress
// @desc    Get current user's progress
// @access  Private
router.get('/me/progress', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('completedModules', 'title destination');

    const quizAttempts = await QuizAttempt.find({ userId: req.user.id })
      .sort('-createdAt')
      .limit(10);

    const submissions = await ChallengeSubmission.find({ userId: req.user.id })
      .populate('challengeId', 'title category');

    const recentActivity = await ActivityLog.find({ userId: req.user.id })
      .sort('-createdAt')
      .limit(10);

    res.json({
      success: true,
      progress: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        completedModules: user.completedModules,
        quizAttempts,
        submissions,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/badges
// @desc    Get current user's badges
// @access  Private
router.get('/me/badges', protect, async (req, res, next) => {
  try {
    const badges = await UserBadge.find({ userId: req.user.id })
      .populate('badgeId')
      .sort('-earnedAt');

    res.json({ success: true, badges });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
