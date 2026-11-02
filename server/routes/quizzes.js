const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const LearningModule = require('../models/LearningModule');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

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
    const questions = module.quizQuestions.map((q, index) => ({
      index,
      question: q.question,
      options: q.options,
    }));

    res.json({ success: true, questions, moduleTitle: module.title });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/quizzes/:moduleId/submit
// @desc    Submit quiz answers — server-side scoring
// @access  Private
router.post('/:moduleId/submit', protect, async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const { answers } = req.body; // Array of { questionIndex, selectedAnswer }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers are required' });
    }

    // Check if user has already passed this quiz
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

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70; // 70% to pass

    // Only award XP for first pass
    let xpEarned = 0;
    if (passed && !existingPass) {
      xpEarned = module.xpReward;
      const user = await User.findById(req.user.id);
      user.xp += xpEarned;
      user.calculateLevel();
      if (!user.completedModules.includes(module._id)) {
        user.completedModules.push(module._id);
      }
      await user.save();
    }

    // Save attempt
    const attempt = await QuizAttempt.create({
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

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      type: passed ? 'quiz_passed' : 'quiz_failed',
      description: `${passed ? 'Passed' : 'Failed'} quiz for: ${module.title} (${percentage}%)`,
      metadata: { moduleId: module._id, score, totalQuestions, percentage },
    });

    res.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      passed,
      xpEarned,
      alreadyPassed: !!existingPass,
      results,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
