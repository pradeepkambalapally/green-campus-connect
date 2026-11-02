const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const LearningModule = require('../models/LearningModule');
const ModuleProgress = require('../models/ModuleProgress');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

// @route   GET /api/quizzes/:moduleId
// @desc    Get quiz questions for a module
// @access  Private
router.get('/:moduleId', protect, async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Return questions without correct answers
    const questions = (module.quizQuestions || []).map((q, index) => ({
      index,
      question: q.question,
      options: q.options,
    }));

    res.json({
      success: true,
      questions,
      moduleTitle: module.title,
      destination: module.destination,
      xpReward: module.xpReward,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/quizzes/:moduleId/submit
// @desc    Submit quiz answers — server-side scoring & progression unlocking
// @access  Private
router.post('/:moduleId/submit', protect, async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const { answers } = req.body; // Array of { questionIndex, selectedAnswer }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    // Check if user has already passed this quiz previously
    const existingPass = await QuizAttempt.findOne({
      userId: req.user.id,
      moduleId: module._id,
      passed: true,
    });

    // Score on the server
    let score = 0;
    const totalQuestions = module.quizQuestions.length;
    const results = module.quizQuestions.map((q, index) => {
      const userAnswer = answers.find(a => a.questionIndex === index);
      const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : -1;
      const isCorrect = selectedAnswer === q.correctAnswer;
      if (isCorrect) score++;

      return {
        questionIndex: index,
        selectedAnswer,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      };
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= 70; // 70% to pass

    // Only award XP and unlock progression for the FIRST time passing
    let xpEarned = 0;
    let badgeAwarded = null;

    if (passed && !existingPass) {
      xpEarned = module.xpReward;
      const user = await User.findById(req.user.id);
      user.xp += xpEarned;
      user.calculateLevel();

      if (!user.completedModules.some(id => id.toString() === module._id.toString())) {
        user.completedModules.push(module._id);
      }
      await user.save();

      // Check destination badge
      const badgeMap = {
        'Forest of Waste Wisdom': 'Waste Warrior',
        'Water World': 'Water Guardian',
        'Energy Valley': 'Energy Saver',
        'Green Mobility Trail': 'Green Mobility Champion',
        'Eco Living Island': 'Sustainability Champion',
      };
      const badgeName = badgeMap[module.destination];
      if (badgeName) {
        const badgeDoc = await Badge.findOne({ name: badgeName });
        if (badgeDoc) {
          const alreadyHad = await UserBadge.findOne({ userId: user._id, badgeId: badgeDoc._id });
          if (!alreadyHad) {
            await UserBadge.create({ userId: user._id, badgeId: badgeDoc._id });
            await ActivityLog.create({
              userId: user._id,
              type: 'badge_earned',
              description: `Earned "${badgeDoc.name}" accolade!`,
              metadata: { badgeId: badgeDoc._id },
            });
            badgeAwarded = badgeDoc;
          }
        }
      }
    }

    // Save attempt record
    await QuizAttempt.create({
      userId: req.user.id,
      moduleId: module._id,
      answers: results.map(r => ({
        questionIndex: r.questionIndex,
        selectedAnswer: r.selectedAnswer,
        isCorrect: r.isCorrect,
      })),
      score,
      totalQuestions,
      percentage,
      passed,
      xpEarned,
    });

    // Update persistent ModuleProgress
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

    progress.quizCompleted = passed;
    progress.quizScore = score;
    progress.quizPercentage = percentage;
    if (passed) {
      progress.isCompleted = true;
      progress.readingCompleted = true;
      progress.completedAt = new Date();
      if (!existingPass) progress.xpAwarded = xpEarned;
    }
    progress.lastAccessedAt = new Date();
    await progress.save();

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      type: passed ? 'quiz_passed' : 'quiz_failed',
      description: `${passed ? 'Mastered' : 'Attempted'} quiz for: ${module.destination} (${percentage}%)`,
      metadata: { moduleId: module._id, score, totalQuestions, percentage, passed },
    });

    res.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      passed,
      xpEarned,
      alreadyPassed: !!existingPass,
      badgeAwarded,
      results,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
