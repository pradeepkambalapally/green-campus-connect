const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const LearningModule = require('../models/LearningModule');
const ModuleProgress = require('../models/ModuleProgress');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const ActivityLog = require('../models/ActivityLog');

// Level title lookup
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

// 5 canonical sustainability destinations
const DESTINATIONS = [
  'Forest of Waste Wisdom',
  'Water World',
  'Energy Valley',
  'Green Mobility Trail',
  'Eco Living Island',
];

// @route   GET /api/users/me/dashboard
// @desc    Get aggregated student dashboard data
// @access  Private
router.get('/me/dashboard', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('completedModules', 'title destination order xpReward');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Level progression calculation
    const currentXp = user.xp || 0;
    const currentLevel = user.level || 1;
    const xpInCurrentLevel = currentXp % 500;
    const xpForNextLevel = 500;
    const progressToNextLevel = Math.round((xpInCurrentLevel / xpForNextLevel) * 100);
    const levelTitle = getLevelTitle(currentLevel);

    // Modules & destinations count
    const allModules = await LearningModule.find({ isActive: true }).select('title destination order xpReward');
    const totalModulesCount = allModules.length;
    const completedModuleIds = (user.completedModules || []).map(m => m._id.toString());
    const completedModulesCount = completedModuleIds.length;

    // Calculate completed destinations
    const completedDestinations = DESTINATIONS.filter(dest => {
      const destModules = allModules.filter(m => m.destination === dest);
      if (destModules.length === 0) return false;
      return destModules.every(m => completedModuleIds.includes(m._id.toString()));
    });

    const overallProgressPercent = totalModulesCount > 0
      ? Math.round((completedModulesCount / totalModulesCount) * 100)
      : 0;

    // Challenges stats & active preview
    const [challengesJoinedCount, activeChallengesList, userSubmissions] = await Promise.all([
      Challenge.countDocuments({ participants: req.user.id }),
      Challenge.find({ isActive: true }).sort('-createdAt').limit(3),
      ChallengeSubmission.find({ userId: req.user.id }),
    ]);

    const activeChallenges = activeChallengesList.map(ch => {
      const hasJoined = ch.participants.some(p => p.toString() === req.user.id.toString());
      const sub = userSubmissions.find(s => s.challengeId.toString() === ch._id.toString());
      return {
        _id: ch._id,
        title: ch.title,
        description: ch.description,
        category: ch.category,
        difficulty: ch.difficulty,
        rewardXP: ch.rewardXP,
        endDate: ch.endDate,
        icon: ch.icon,
        hasJoined,
        submissionStatus: sub ? sub.status : null,
      };
    });

    // Badges
    const [badgesCount, recentBadges] = await Promise.all([
      UserBadge.countDocuments({ userId: req.user.id }),
      UserBadge.find({ userId: req.user.id })
        .populate('badgeId')
        .sort('-earnedAt')
        .limit(4),
    ]);

    // Activity feed
    const recentActivities = await ActivityLog.find({ userId: req.user.id })
      .sort('-createdAt')
      .limit(6);

    // Leaderboard preview (top 5 + current student's rank)
    const [topStudents, userRank, totalStudents] = await Promise.all([
      User.find({ role: 'student' })
        .select('name xp level avatar streak')
        .sort('-xp')
        .limit(5),
      User.countDocuments({
        role: 'student',
        xp: { $gt: currentXp },
      }) + 1,
      User.countDocuments({ role: 'student' }),
    ]);

    const leaderboardPreview = {
      topStudents,
      userRank,
      totalStudents,
    };

    res.json({
      success: true,
      dashboard: {
        profile: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          level: currentLevel,
          levelTitle,
          xp: currentXp,
          xpInCurrentLevel,
          xpForNextLevel,
          progressToNextLevel,
          streak: user.streak || 0,
        },
        stats: {
          totalXP: currentXp,
          completedModulesCount,
          totalModulesCount,
          challengesJoinedCount,
          badgesCount,
        },
        learningJourney: {
          completedDestinationsCount: completedDestinations.length,
          totalDestinationsCount: DESTINATIONS.length,
          completedModulesCount,
          totalModulesCount,
          overallProgressPercent,
          completedDestinations,
        },
        activeChallenges,
        recentBadges,
        recentActivities,
        leaderboardPreview,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/learning-progress
// @desc    Get current student's overall learning journey progress across the 5 destinations
// @access  Private
router.get('/me/learning-progress', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('completedModules', 'title destination order xpReward');
    const modules = await LearningModule.find({ isActive: true }).sort('order');
    const progressList = await ModuleProgress.find({ userId: req.user.id });

    const completedIds = (user?.completedModules || []).map(m => m._id.toString());

    let previousCompleted = true;
    const destinationsProgress = modules.map((mod, index) => {
      const isCompleted = completedIds.includes(mod._id.toString());
      const isLocked = !previousCompleted;
      const isAvailable = !isLocked && !isCompleted;
      const prog = progressList.find(p => p.moduleId.toString() === mod._id.toString());

      previousCompleted = isCompleted;

      return {
        moduleId: mod._id,
        order: mod.order,
        destination: mod.destination,
        title: mod.title,
        icon: mod.icon,
        xpReward: mod.xpReward,
        isCompleted,
        isLocked,
        isAvailable,
        readingCompleted: prog?.readingCompleted || false,
        quizCompleted: prog?.quizCompleted || false,
      };
    });

    const completedCount = completedIds.length;
    const totalCount = modules.length;
    const overallProgressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    res.json({
      success: true,
      destinationsProgress,
      totalDestinations: totalCount,
      completedDestinations: completedCount,
      overallProgressPercent,
      currentXp: user.xp || 0,
    });
  } catch (error) {
    next(error);
  }
});

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
