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
// @desc    Get all submissions with filtering by status and category
// @access  Admin
router.get('/submissions', async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    let submissions = await ChallengeSubmission.find(filter)
      .populate('userId', 'name email avatar level xp')
      .populate('challengeId', 'title category difficulty rewardXP icon instructions evidenceRequirements')
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    // Filter by challenge category if provided
    if (category && category !== 'all') {
      submissions = submissions.filter(s => s.challengeId?.category === category);
    }

    // Search filter across student name, student email, and challenge title
    if (search) {
      const term = search.toLowerCase();
      submissions = submissions.filter(s =>
        s.userId?.name?.toLowerCase().includes(term) ||
        s.userId?.email?.toLowerCase().includes(term) ||
        s.challengeId?.title?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    }

    // Counts for tab badges
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      ChallengeSubmission.countDocuments({ status: 'pending' }),
      ChallengeSubmission.countDocuments({ status: 'approved' }),
      ChallengeSubmission.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      submissions,
      counts: {
        total: pendingCount + approvedCount + rejectedCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/submissions/:id
// @desc    Get specific submission details
// @access  Admin
router.get('/submissions/:id', async (req, res, next) => {
  try {
    const submission = await ChallengeSubmission.findById(req.params.id)
      .populate('userId', 'name email avatar level xp streak')
      .populate('challengeId')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, submission });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/submissions/:id/approve
// @desc    Approve a submission (atomically awards XP from database challenge model)
// @access  Admin
router.patch('/submissions/:id/approve', async (req, res, next) => {
  try {
    const submission = await ChallengeSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Prevent duplicate approval or re-approving
    if (submission.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Submission has already been approved previously.' });
    }

    const challenge = await Challenge.findById(submission.challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Associated challenge not found' });
    }

    const reward = challenge.rewardXP || 50;

    // Mark approved
    submission.status = 'approved';
    submission.xpAwarded = reward;
    submission.rejectReason = '';
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    await submission.save();

    // Award XP to student
    const user = await User.findById(submission.userId);
    if (user) {
      user.xp += reward;
      user.calculateLevel();
      await user.save();

      // Log verified activity
      await ActivityLog.create({
        userId: submission.userId,
        type: 'submission_approved',
        description: `Evidence approved for "${challenge.title}"! (+${reward} XP)`,
        metadata: { challengeId: challenge._id, xpEarned: reward, submissionId: submission._id },
      });
    }

    const populatedSubmission = await ChallengeSubmission.findById(submission._id)
      .populate('userId', 'name email avatar level xp')
      .populate('challengeId', 'title category difficulty rewardXP icon')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Submission approved! ${reward} XP awarded to student.`,
      submission: populatedSubmission,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/submissions/:id/reject
// @desc    Reject a submission with a mandatory or optional reason
// @access  Admin
router.patch('/submissions/:id/reject', async (req, res, next) => {
  try {
    const { reason } = req.body;
    const submission = await ChallengeSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already approved submission that has granted XP.',
      });
    }

    submission.status = 'rejected';
    submission.rejectReason = reason || 'Evidence image was unclear or did not demonstrate the required campus activity. Please review instructions and resubmit.';
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    await submission.save();

    const challenge = await Challenge.findById(submission.challengeId);

    await ActivityLog.create({
      userId: submission.userId,
      type: 'submission_rejected',
      description: `Submission for "${challenge?.title || 'Challenge'}" was reviewed: revision requested`,
      metadata: { challengeId: submission.challengeId, reason: submission.rejectReason, submissionId: submission._id },
    });

    const populatedSubmission = await ChallengeSubmission.findById(submission._id)
      .populate('userId', 'name email avatar level xp')
      .populate('challengeId', 'title category difficulty rewardXP icon')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Submission has been marked as rejected with feedback.',
      submission: populatedSubmission,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/challenges
// @desc    Create a challenge
// @access  Admin
router.post('/challenges', async (req, res, next) => {
  try {
    const challenge = await Challenge.create({
      ...req.body,
      createdBy: req.user.id,
    });
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
