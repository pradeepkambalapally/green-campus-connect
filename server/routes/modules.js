const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const LearningModule = require('../models/LearningModule');
const ModuleProgress = require('../models/ModuleProgress');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

// @route   GET /api/modules
// @desc    Get all learning modules with student progression and locked states
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const modules = await LearningModule.find({ isActive: true })
      .select('-quizQuestions')
      .sort('order');

    const user = await User.findById(req.user.id);
    const completedIds = (user?.completedModules || []).map(id => id.toString());

    // Fetch student's progress records across all modules
    const userProgressRecords = await ModuleProgress.find({ userId: req.user.id });

    // Compute sequential lock status
    // Order 1 is always unlocked. Order N requires Order N-1 to be completed.
    let previousCompleted = true;

    const modulesWithStatus = modules.map((mod, index) => {
      const isCompleted = completedIds.includes(mod._id.toString());
      const isLocked = !previousCompleted;
      const isAvailable = !isLocked && !isCompleted;

      // Find user progress for this module
      const prog = userProgressRecords.find(p => p.moduleId.toString() === mod._id.toString());

      // Unlock requirement text
      let unlockRequirement = '';
      if (isLocked && index > 0) {
        unlockRequirement = `Complete "${modules[index - 1].destination}" to unlock this destination.`;
      }

      // Prepare next destination's prerequisite check
      previousCompleted = isCompleted;

      return {
        ...mod.toObject(),
        isCompleted,
        isLocked,
        isAvailable,
        unlockRequirement,
        totalSections: mod.sections?.length || 0,
        progress: prog ? {
          currentSection: prog.currentSection,
          completedSectionsCount: prog.completedSections?.length || 0,
          readingCompleted: prog.readingCompleted,
          quizCompleted: prog.quizCompleted,
          quizScore: prog.quizScore,
          quizPercentage: prog.quizPercentage,
        } : null,
      };
    });

    res.json({
      success: true,
      modules: modulesWithStatus,
      totalModules: modules.length,
      completedCount: completedIds.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/modules/:id
// @desc    Get single module with full lesson sections and student progress
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Learning destination not found' });
    }

    const user = await User.findById(req.user.id);
    const completedIds = (user?.completedModules || []).map(id => id.toString());
    const isCompleted = completedIds.includes(module._id.toString());

    // Check if locked
    let isLocked = false;
    let unlockRequirement = '';
    if (module.order > 1) {
      const prevModule = await LearningModule.findOne({ order: module.order - 1, isActive: true });
      if (prevModule && !completedIds.includes(prevModule._id.toString())) {
        isLocked = true;
        unlockRequirement = `Complete "${prevModule.destination}" to unlock this destination.`;
      }
    }

    // Find or initialize progress
    let progress = await ModuleProgress.findOne({
      userId: req.user.id,
      moduleId: module._id,
    });

    if (!progress && !isLocked) {
      progress = await ModuleProgress.create({
        userId: req.user.id,
        moduleId: module._id,
        currentSection: 0,
        completedSections: [],
      });
    }

    // Return module without revealing correct answers in quizQuestions
    const sanitizedQuiz = (module.quizQuestions || []).map((q, idx) => ({
      index: idx,
      question: q.question,
      options: q.options,
    }));

    res.json({
      success: true,
      module: {
        ...module.toObject(),
        quizQuestions: sanitizedQuiz,
        quizQuestionsCount: module.quizQuestions?.length || 0,
      },
      progress,
      isLocked,
      isCompleted,
      unlockRequirement,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/modules/:id/progress
// @desc    Get individual reading and quiz progress for a module
// @access  Private
router.get('/:id/progress', protect, async (req, res, next) => {
  try {
    let progress = await ModuleProgress.findOne({
      userId: req.user.id,
      moduleId: req.params.id,
    });

    if (!progress) {
      progress = {
        userId: req.user.id,
        moduleId: req.params.id,
        currentSection: 0,
        completedSections: [],
        readingCompleted: false,
        quizCompleted: false,
        isCompleted: false,
      };
    }

    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/modules/:id/progress
// @desc    Update student reading progress (persisted to MongoDB)
// @access  Private
router.patch('/:id/progress', protect, async (req, res, next) => {
  try {
    const { currentSection, sectionCompleted } = req.body;
    const moduleId = req.params.id;

    const module = await LearningModule.findById(moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    let progress = await ModuleProgress.findOne({
      userId: req.user.id,
      moduleId,
    });

    if (!progress) {
      progress = new ModuleProgress({
        userId: req.user.id,
        moduleId,
        currentSection: 0,
        completedSections: [],
      });
    }

    if (typeof currentSection === 'number') {
      progress.currentSection = currentSection;
    }

    if (typeof sectionCompleted === 'number') {
      if (!progress.completedSections.includes(sectionCompleted)) {
        progress.completedSections.push(sectionCompleted);
      }
    }

    // Check if reading is complete
    const totalSectionsCount = module.sections?.length || 1;
    if (progress.completedSections.length >= totalSectionsCount) {
      progress.readingCompleted = true;
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.json({
      success: true,
      progress: {
        currentSection: progress.currentSection,
        completedSections: progress.completedSections,
        readingCompleted: progress.readingCompleted,
        quizCompleted: progress.quizCompleted,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/modules/:id/complete
// @desc    Mark module as completed after satisfying completion requirements
// @access  Private
router.post('/:id/complete', protect, async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const user = await User.findById(req.user.id);

    // Prevent duplicate completion rewards
    if (user.completedModules.some(id => id.toString() === module._id.toString())) {
      return res.json({
        success: true,
        message: 'Module already completed previously',
        alreadyCompleted: true,
        totalXP: user.xp,
        level: user.level,
      });
    }

    // Add to completed modules and award XP
    user.completedModules.push(module._id);
    user.xp += module.xpReward;
    user.calculateLevel();
    await user.save();

    // Update or create ModuleProgress
    let progress = await ModuleProgress.findOne({
      userId: req.user.id,
      moduleId: module._id,
    });

    if (!progress) {
      progress = new ModuleProgress({
        userId: req.user.id,
        moduleId: module._id,
      });
    }

    progress.isCompleted = true;
    progress.readingCompleted = true;
    progress.xpAwarded = module.xpReward;
    progress.completedAt = new Date();
    await progress.save();

    // Log Activity
    await ActivityLog.create({
      userId: user._id,
      type: 'module_completed',
      description: `Conquered ${module.destination}: ${module.title}`,
      metadata: { moduleId: module._id, xpEarned: module.xpReward },
    });

    // Award destination-specific badge if defined
    const badgeCriteriaMap = {
      'Forest of Waste Wisdom': 'Waste Warrior',
      'Water World': 'Water Guardian',
      'Energy Valley': 'Energy Saver',
      'Green Mobility Trail': 'Green Mobility Champion',
      'Eco Living Island': 'Sustainability Champion',
    };

    const targetBadgeName = badgeCriteriaMap[module.destination];
    let badgeAwarded = null;

    if (targetBadgeName) {
      const badge = await Badge.findOne({ name: targetBadgeName });
      if (badge) {
        const alreadyHasBadge = await UserBadge.findOne({
          userId: user._id,
          badgeId: badge._id,
        });

        if (!alreadyHasBadge) {
          await UserBadge.create({
            userId: user._id,
            badgeId: badge._id,
          });

          await ActivityLog.create({
            userId: user._id,
            type: 'badge_earned',
            description: `Earned the "${badge.name}" badge!`,
            metadata: { badgeId: badge._id },
          });

          badgeAwarded = badge;
        }
      }
    }

    res.json({
      success: true,
      message: `Congratulations! You conquered ${module.destination}!`,
      xpEarned: module.xpReward,
      totalXP: user.xp,
      level: user.level,
      badgeAwarded,
      completedModulesCount: user.completedModules.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
