const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const LearningModule = require('../models/LearningModule');
const ModuleProgress = require('../models/ModuleProgress');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const ActivityLog = require('../models/ActivityLog');

// Optional Cloudinary support for avatars
let cloudinary;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  try {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } catch (err) {
    console.log('Cloudinary not configured for avatars, using local storage.');
  }
}

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

// Automatic badge evaluator based on authentic database milestones
const evaluateAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId).populate('completedModules', 'destination title order');
    if (!user) return [];

    const [allBadges, userBadges, approvedSubmissionsCount] = await Promise.all([
      Badge.find(),
      UserBadge.find({ userId }),
      ChallengeSubmission.countDocuments({ userId, status: 'approved' }),
    ]);

    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId?.toString()));
    const completedDestinations = (user.completedModules || []).map(m => m.destination);
    const newlyAwarded = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge._id.toString())) continue;

      let qualifies = false;
      if (badge.criteriaType === 'special') {
        if (badge.criteriaValue === 'welcome') {
          qualifies = true; // Eco Beginner on signup/activity
        } else if (badge.criteriaValue === 'all_modules') {
          qualifies = completedDestinations.length >= 5;
        }
      } else if (badge.criteriaType === 'module_complete') {
        qualifies = completedDestinations.includes(badge.criteriaValue);
      } else if (badge.criteriaType === 'challenge_complete') {
        qualifies = approvedSubmissionsCount >= Number(badge.criteriaValue);
      } else if (badge.criteriaType === 'streak') {
        qualifies = (user.streak || 0) >= Number(badge.criteriaValue);
      } else if (badge.criteriaType === 'xp_threshold') {
        qualifies = (user.xp || 0) >= Number(badge.criteriaValue);
      }

      if (qualifies) {
        try {
          await UserBadge.create({ userId, badgeId: badge._id });
          await ActivityLog.create({
            userId,
            type: 'badge_earned',
            description: `Earned accolade: ${badge.name}!`,
            metadata: { badgeId: badge._id },
          });
          newlyAwarded.push(badge);
          earnedBadgeIds.add(badge._id.toString());
        } catch (e) {
          // Ignore unique duplicate collisions
        }
      }
    }

    return newlyAwarded;
  } catch (err) {
    console.error('Badge evaluation error:', err.message);
    return [];
  }
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
      }).then((c) => c + 1),
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
          completedChallengesCount: userSubmissions.filter(s => s.status === 'approved').length,
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
// @desc    Get all achievement badges with student unlocked state and dates
// @access  Private
router.get('/me/badges', protect, async (req, res, next) => {
  try {
    await evaluateAndAwardBadges(req.user.id);

    const [allBadges, userBadges] = await Promise.all([
      Badge.find().sort('createdAt'),
      UserBadge.find({ userId: req.user.id }).populate('badgeId').sort('-earnedAt'),
    ]);

    const earnedMap = new Map();
    for (const ub of userBadges) {
      if (ub.badgeId) {
        earnedMap.set(ub.badgeId._id.toString(), ub.earnedAt);
      }
    }

    const badges = allBadges.map(b => {
      const earnedAt = earnedMap.get(b._id.toString()) || null;
      let category = 'Milestones';
      if (b.criteriaType === 'module_complete' || b.name === 'Eco Beginner' || b.criteriaValue === 'all_modules') {
        category = 'Learning Adventures';
      } else if (b.criteriaType === 'challenge_complete') {
        category = 'Campus Challenges';
      } else if (b.criteriaType === 'streak') {
        category = 'Streaks & Consistency';
      }

      return {
        _id: b._id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        criteria: b.criteria,
        criteriaType: b.criteriaType,
        criteriaValue: b.criteriaValue,
        category,
        isUnlocked: !!earnedAt,
        earnedAt,
      };
    });

    const unlockedCount = badges.filter(b => b.isUnlocked).length;
    const totalCount = badges.length;
    const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    res.json({
      success: true,
      badges,
      stats: {
        total: totalCount,
        unlocked: unlockedCount,
        locked: totalCount - unlockedCount,
        progressPercent,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/profile
// @desc    Get detailed student profile with gamification, level and accomplishments
// @access  Private
router.get('/me/profile', protect, async (req, res, next) => {
  try {
    await evaluateAndAwardBadges(req.user.id);

    const user = await User.findById(req.user.id).populate('completedModules', 'title destination order xpReward icon');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [approvedSubmissions, pendingSubmissions, userBadges, userRank, totalStudents] = await Promise.all([
      ChallengeSubmission.find({ userId: req.user.id, status: 'approved' })
        .populate('challengeId', 'title category rewardXP icon')
        .sort('-reviewedAt'),
      ChallengeSubmission.countDocuments({ userId: req.user.id, status: 'pending' }),
      UserBadge.find({ userId: req.user.id }).populate('badgeId').sort('-earnedAt'),
      User.countDocuments({ role: 'student', xp: { $gt: user.xp } }).then((c) => c + 1),
      User.countDocuments({ role: 'student' }),
    ]);

    const levelTitle = getLevelTitle(user.level || 1);
    const xpInCurrentLevel = (user.xp || 0) % 500;
    const xpForNextLevel = 500;
    const progressToNextLevel = Math.round((xpInCurrentLevel / xpForNextLevel) * 100);

    res.json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        bio: user.bio || '',
        department: user.department || '',
        yearOfStudy: user.yearOfStudy || '',
        createdAt: user.createdAt,
        xp: user.xp || 0,
        level: user.level || 1,
        levelTitle,
        xpInCurrentLevel,
        xpForNextLevel,
        progressToNextLevel,
        streak: user.streak || 0,
        rank: userRank,
        totalStudents,
      },
      stats: {
        totalXP: user.xp || 0,
        level: user.level || 1,
        completedModulesCount: user.completedModules?.length || 0,
        approvedChallengesCount: approvedSubmissions.length,
        pendingSubmissionsCount: pendingSubmissions,
        badgesCount: userBadges.length,
        streak: user.streak || 0,
      },
      completedModules: user.completedModules || [],
      approvedChallenges: approvedSubmissions,
      recentBadges: userBadges.slice(0, 4),
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me/profile
// @desc    Update student profile information & optional password
// @access  Private
router.put('/me/profile', protect, async (req, res, next) => {
  try {
    const { name, bio, department, yearOfStudy, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (typeof bio === 'string') {
      user.bio = bio.trim();
    }
    if (typeof department === 'string') {
      user.department = department.trim();
    }
    if (typeof yearOfStudy === 'string') {
      user.yearOfStudy = yearOfStudy.trim();
    }
    if (typeof avatar === 'string') {
      user.avatar = avatar.trim();
    }

    // Optional password update
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        department: user.department,
        yearOfStudy: user.yearOfStudy,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/me/avatar
// @desc    Upload new profile avatar picture
// @access  Private
router.post('/me/avatar', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide an image file (JPEG, PNG, WebP up to 5MB)' });
    }

    let avatarUrl = `/uploads/${req.file.filename}`;
    if (cloudinary) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'green-campus/avatars',
        });
        avatarUrl = uploadResult.secure_url;
      } catch (err) {
        console.log('Cloudinary avatar upload fallback:', err.message);
      }
    }

    const user = await User.findById(req.user.id);
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Profile avatar updated successfully!',
      avatarUrl,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/challenges
// @desc    Get all challenges joined by the authenticated student
// @access  Private
router.get('/me/challenges', protect, async (req, res, next) => {
  try {
    const challenges = await Challenge.find({
      participants: req.user.id,
    }).sort('-createdAt');

    const submissions = await ChallengeSubmission.find({ userId: req.user.id });

    const challengesWithSubmission = challenges.map(ch => {
      const sub = submissions.find(s => s.challengeId.toString() === ch._id.toString());
      return {
        ...ch.toObject(),
        hasJoined: true,
        submissionStatus: sub ? sub.status : null,
        submission: sub || null,
      };
    });

    res.json({ success: true, challenges: challengesWithSubmission });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/submissions
// @desc    Get all challenge submissions made by the authenticated student
// @access  Private
router.get('/me/submissions', protect, async (req, res, next) => {
  try {
    const submissions = await ChallengeSubmission.find({ userId: req.user.id })
      .populate('challengeId', 'title category difficulty rewardXP icon endDate')
      .sort('-createdAt');

    res.json({ success: true, submissions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
