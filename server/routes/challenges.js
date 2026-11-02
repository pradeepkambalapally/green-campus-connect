const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/challenges
// @desc    Get all active challenges with student participation and submission status
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, difficulty, status, search } = req.query;

    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const challenges = await Challenge.find(query).sort('-createdAt');

    // Retrieve all submissions for this user
    const submissions = await ChallengeSubmission.find({ userId: req.user.id });

    // Map challenges with personalized user status
    let challengesWithStatus = challenges.map((ch) => {
      const hasJoined = ch.participants.some(p => p.toString() === req.user.id.toString());
      const submission = submissions.find(s => s.challengeId.toString() === ch._id.toString());

      return {
        ...ch.toObject(),
        hasJoined,
        participantsCount: ch.participants?.length || 0,
        submissionStatus: submission ? submission.status : null,
        submission: submission ? {
          _id: submission._id,
          status: submission.status,
          imageUrl: submission.imageUrl,
          description: submission.description,
          rejectReason: submission.rejectReason,
          reviewedAt: submission.reviewedAt,
          createdAt: submission.createdAt,
        } : null,
      };
    });

    // Optional status filter: 'joined', 'pending', 'approved', 'rejected', 'not_joined'
    if (status && status !== 'all') {
      if (status === 'joined') {
        challengesWithStatus = challengesWithStatus.filter(c => c.hasJoined && !c.submissionStatus);
      } else if (status === 'pending') {
        challengesWithStatus = challengesWithStatus.filter(c => c.submissionStatus === 'pending');
      } else if (status === 'approved') {
        challengesWithStatus = challengesWithStatus.filter(c => c.submissionStatus === 'approved');
      } else if (status === 'rejected') {
        challengesWithStatus = challengesWithStatus.filter(c => c.submissionStatus === 'rejected');
      } else if (status === 'not_joined') {
        challengesWithStatus = challengesWithStatus.filter(c => !c.hasJoined);
      }
    }

    res.json({
      success: true,
      challenges: challengesWithStatus,
      totalCount: challengesWithStatus.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/challenges/:id
// @desc    Get single challenge with personalized participation and submission status
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const submission = await ChallengeSubmission.findOne({
      userId: req.user.id,
      challengeId: challenge._id,
    });

    const hasJoined = challenge.participants.some(p => p.toString() === req.user.id.toString());

    res.json({
      success: true,
      challenge: {
        ...challenge.toObject(),
        hasJoined,
        participantsCount: challenge.participants?.length || 0,
        submissionStatus: submission ? submission.status : null,
        submission: submission || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/challenges/:id/participation
// @desc    Get student participation status for a specific challenge
// @access  Private
router.get('/:id/participation', protect, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const hasJoined = challenge.participants.some(p => p.toString() === req.user.id.toString());
    const submission = await ChallengeSubmission.findOne({
      userId: req.user.id,
      challengeId: challenge._id,
    });

    res.json({
      success: true,
      participation: {
        challengeId: challenge._id,
        hasJoined,
        submissionStatus: submission ? submission.status : null,
        submission,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/challenges/:id/join
// @desc    Join a challenge (No XP awarded upon joining!)
// @access  Private
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check challenge date
    if (new Date() > new Date(challenge.endDate)) {
      return res.status(400).json({ success: false, message: 'This challenge has already concluded.' });
    }

    // Prevent duplicate participation
    const alreadyJoined = challenge.participants.some(p => p.toString() === req.user.id.toString());
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'You have already joined this challenge.' });
    }

    challenge.participants.push(req.user.id);
    await challenge.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      type: 'challenge_joined',
      description: `Joined sustainability challenge: ${challenge.title}`,
      metadata: { challengeId: challenge._id },
    });

    res.json({
      success: true,
      message: 'Successfully joined the challenge! Complete the mission and submit evidence.',
      hasJoined: true,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/challenges/:id/submit
// @desc    Direct submission route for a challenge
// @access  Private
router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const { description, imageUrl } = req.body;

    if (!description || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Photo evidence and description are required.' });
    }

    // Check if joined
    const hasJoined = challenge.participants.some(p => p.toString() === req.user.id.toString());
    if (!hasJoined) {
      // Auto join if not already
      challenge.participants.push(req.user.id);
      await challenge.save();
    }

    // Check existing submission
    let submission = await ChallengeSubmission.findOne({
      userId: req.user.id,
      challengeId: challenge._id,
    });

    if (submission) {
      if (submission.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'You have already completed and had this challenge approved!',
        });
      }

      if (submission.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Your evidence is currently pending review by an administrator.',
        });
      }

      // If rejected, permit resubmission!
      submission.description = description;
      submission.imageUrl = imageUrl;
      submission.status = 'pending';
      submission.rejectReason = '';
      submission.resubmissionCount = (submission.resubmissionCount || 0) + 1;
      await submission.save();

      await ActivityLog.create({
        userId: req.user.id,
        type: 'challenge_submitted',
        description: `Resubmitted evidence for: ${challenge.title}`,
        metadata: { challengeId: challenge._id, submissionId: submission._id },
      });

      return res.json({
        success: true,
        message: 'Evidence resubmitted successfully! It is now pending review.',
        submission,
      });
    }

    // Create fresh submission
    submission = await ChallengeSubmission.create({
      userId: req.user.id,
      challengeId: challenge._id,
      description,
      imageUrl,
      status: 'pending',
    });

    await ActivityLog.create({
      userId: req.user.id,
      type: 'challenge_submitted',
      description: `Submitted evidence for: ${challenge.title}`,
      metadata: { challengeId: challenge._id, submissionId: submission._id },
    });

    res.status(201).json({
      success: true,
      message: 'Evidence submitted successfully! Administrator verification is pending.',
      submission,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
