const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/leaderboard
// @desc    Get top students by XP
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const leaderboard = await User.find({ role: 'student' })
      .select('name xp level completedModules streak')
      .sort('-xp')
      .limit(limit);

    // Find current user's rank
    const totalStudents = await User.countDocuments({ role: 'student' });
    const userRank = await User.countDocuments({
      role: 'student',
      xp: { $gt: req.user.xp },
    }) + 1;

    res.json({
      success: true,
      leaderboard,
      userRank,
      totalStudents,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
