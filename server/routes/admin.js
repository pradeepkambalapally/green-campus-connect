const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const LearningModule = require('../models/LearningModule');
const ActivityLog = require('../models/ActivityLog');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
// @access  Admin
router.get('/analytics', async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalModules,
      totalChallenges,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      LearningModule.countDocuments(),
      Challenge.countDocuments(),
      ChallengeSubmission.countDocuments({ status: 'pending' }),
      ChallengeSubmission.countDocuments({ status: 'approved' }),
      ChallengeSubmission.countDocuments({ status: 'rejected' }),
    ]);

    const recentActivities = await ActivityLog.find()
      .sort('-createdAt')
      .limit(10)
      .populate('userId', 'name email');

    res.json({
      success: true,
      analytics: {
        totalStudents,
        totalModules,
        totalChallenges,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/submissions
// @desc    Get all submissions
// @access  Admin
router.get('/submissions', async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const submissions = await ChallengeSubmission.find(filter)
      .populate('userId', 'name email')
      .populate('challengeId', 'title category')
      .sort('-createdAt');

    res.json({ success: true, submissions });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/submissions/:id/approve
// @desc    Approve a submission
// @access  Admin
router.patch('/submissions/:id/approve', async (req, res, next) => {
  try {
    const submission = await ChallengeSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Submission already reviewed' });
    }

    submission.status = 'approved';
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    await submission.save();

    // Award XP
    const challenge = await Challenge.findById(submission.challengeId);
    const user = await User.findById(submission.userId);
    user.xp += challenge.rewardXP;
    user.calculateLevel();
    await user.save();

    await ActivityLog.create({
      userId: submission.userId,
      type: 'submission_approved',
      description: `Submission approved for: ${challenge.title}`,
      metadata: { challengeId: challenge._id, xpEarned: challenge.rewardXP },
    });

    res.json({ success: true, submission });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/submissions/:id/reject
// @desc    Reject a submission
// @access  Admin
router.patch('/submissions/:id/reject', async (req, res, next) => {
  try {
    const { reason } = req.body;
    const submission = await ChallengeSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Submission already reviewed' });
    }

    submission.status = 'rejected';
    submission.rejectReason = reason || 'No reason provided';
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    await submission.save();

    await ActivityLog.create({
      userId: submission.userId,
      type: 'submission_rejected',
      description: `Submission rejected for challenge`,
      metadata: { challengeId: submission.challengeId, reason: submission.rejectReason },
    });

    res.json({ success: true, submission });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/challenges
// @desc    Create a challenge
// @access  Admin
router.post('/challenges', async (req, res, next) => {
  try {
    const challenge = await Challenge.create(req.body);
    res.status(201).json({ success: true, challenge });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/challenges/:id
// @desc    Update a challenge
// @access  Admin
router.put('/challenges/:id', async (req, res, next) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.json({ success: true, challenge });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/challenges/:id
// @desc    Delete a challenge
// @access  Admin
router.delete('/challenges/:id', async (req, res, next) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.json({ success: true, message: 'Challenge deleted' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/modules
// @desc    Create a learning module
// @access  Admin
router.post('/modules', async (req, res, next) => {
  try {
    const module = await LearningModule.create(req.body);
    res.status(201).json({ success: true, module });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/modules/:id
// @desc    Update a learning module
// @access  Admin
router.put('/modules/:id', async (req, res, next) => {
  try {
    const module = await LearningModule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    res.json({ success: true, module });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
