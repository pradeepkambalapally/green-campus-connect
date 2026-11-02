const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/modules
// @desc    Get all learning modules
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const modules = await LearningModule.find({ isActive: true })
      .select('-quizQuestions')
      .sort('order');

    // Get user's completed modules
    const user = await User.findById(req.user.id);
    const completedIds = user.completedModules.map(id => id.toString());

    const modulesWithStatus = modules.map(mod => ({
      ...mod.toObject(),
      isCompleted: completedIds.includes(mod._id.toString()),
    }));

    res.json({ success: true, modules: modulesWithStatus });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/modules/:id
// @desc    Get single module with content
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    res.json({ success: true, module });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/modules/:id/complete
// @desc    Mark module as completed
// @access  Private
router.post('/:id/complete', protect, async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const user = await User.findById(req.user.id);

    // Prevent duplicate completion rewards
    if (user.completedModules.includes(module._id)) {
      return res.json({ success: true, message: 'Module already completed', alreadyCompleted: true });
    }

    user.completedModules.push(module._id);
    user.xp += module.xpReward;
    user.calculateLevel();
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      type: 'module_completed',
      description: `Completed module: ${module.title}`,
      metadata: { moduleId: module._id, xpEarned: module.xpReward },
    });

    res.json({
      success: true,
      message: 'Module completed!',
      xpEarned: module.xpReward,
      totalXP: user.xp,
      level: user.level,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
