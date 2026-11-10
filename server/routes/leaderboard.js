const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const ChallengeSubmission = require('../models/ChallengeSubmission');

// Level title lookup helper
const getLevelTitle = (level) => {
  const titles = [
    'Eco Seedling',
    'Green Sprout',
    'Nature Defender',
    'Eco Explorer',
    'Planet Guardian',
    'Sustainability Champion',
  ];
  return titles[Math.min(Math.max(level - 1, 0), titles.length - 1)] || 'Eco Pioneer';
};

// @route   GET /api/leaderboard
// @desc    Get real students ranked by their earned sustainability XP
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search ? req.query.search.trim() : '';
    const department = req.query.department ? req.query.department.trim() : '';

    // Base query: only students
    const filter = { role: 'student' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'all') {
      filter.department = department;
    }

    // Retrieve sorted students from MongoDB
    const students = await User.find(filter)
      .select('name email avatar department yearOfStudy xp level streak completedModules createdAt')
      .sort('-xp -streak createdAt')
      .limit(limit);

    // Get all approved submissions counts in one aggregation
    const studentIds = students.map(s => s._id);
    const approvedCounts = await ChallengeSubmission.aggregate([
      { $match: { userId: { $in: studentIds }, status: 'approved' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const challengeCountMap = new Map(approvedCounts.map(a => [a._id.toString(), a.count]));

    // Map leaderboard items with rank and badges
    const leaderboard = students.map((s, index) => {
      const isCurrentUser = s._id.toString() === req.user.id.toString();
      const rank = index + 1;
      let medal = null;
      if (rank === 1) medal = 'gold';
      else if (rank === 2) medal = 'silver';
      else if (rank === 3) medal = 'bronze';

      return {
        _id: s._id,
        rank,
        name: s.name,
        avatar: s.avatar || '',
        department: s.department || 'General Campus',
        yearOfStudy: s.yearOfStudy || '',
        xp: s.xp || 0,
        level: s.level || 1,
        levelTitle: getLevelTitle(s.level || 1),
        streak: s.streak || 0,
        completedModulesCount: s.completedModules?.length || 0,
        approvedChallengesCount: challengeCountMap.get(s._id.toString()) || 0,
        medal,
        isCurrentUser,
      };
    });

    // Compute current authenticated student's exact ranking
    const currentStudent = await User.findById(req.user.id);
    const totalStudents = await User.countDocuments({ role: 'student' });
    const userRank = (await User.countDocuments({
      role: 'student',
      xp: { $gt: currentStudent.xp || 0 },
    })) + 1;

    // Find student directly ahead for XP gap insight
    let xpToNextRank = 0;
    if (userRank > 1) {
      const nextAhead = await User.findOne({
        role: 'student',
        xp: { $gt: currentStudent.xp || 0 },
      }).sort('xp');
      if (nextAhead) {
        xpToNextRank = (nextAhead.xp - (currentStudent.xp || 0)) + 1;
      }
    }

    // Campus-wide stats
    const totalCampusStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: null, totalXP: { $sum: '$xp' } } },
    ]);
    const totalCampusXP = totalCampusStats[0]?.totalXP || 0;

    // Distinct departments for filter
    const departments = await User.distinct('department', { role: 'student', department: { $ne: '' } });

    res.json({
      success: true,
      leaderboard,
      currentUserRank: {
        rank: userRank,
        totalStudents,
        xp: currentStudent.xp || 0,
        level: currentStudent.level || 1,
        levelTitle: getLevelTitle(currentStudent.level || 1),
        name: currentStudent.name,
        avatar: currentStudent.avatar || '',
        department: currentStudent.department || '',
        streak: currentStudent.streak || 0,
        xpToNextRank,
      },
      stats: {
        totalStudents,
        totalCampusXP,
        averageXP: totalStudents > 0 ? Math.round(totalCampusXP / totalStudents) : 0,
      },
      departments,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
