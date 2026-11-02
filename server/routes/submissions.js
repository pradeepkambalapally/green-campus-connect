const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Challenge = require('../models/Challenge');
const ActivityLog = require('../models/ActivityLog');

// Optional Cloudinary support
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
    console.log('Cloudinary not configured or package missing, using local storage.');
  }
}

// @route   POST /api/submissions/upload
// @desc    Upload an evidence image (JPEG, PNG, WebP up to 5MB)
// @access  Private
router.post('/upload', protect, (req, res) => {
  upload.single('evidenceImage')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed. Ensure the image is JPEG, PNG, or WebP and under 5 MB.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was uploaded.',
      });
    }

    try {
      // If Cloudinary is available, upload directly to Cloudinary
      if (cloudinary) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'green-campus-connect/evidence',
          transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
        });

        // Clean up local temp file
        fs.unlinkSync(req.file.path);

        return res.json({
          success: true,
          imageUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      }

      // Development fallback: use served static URL
      const relativeUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        imageUrl: relativeUrl,
        filename: req.file.filename,
      });
    } catch (uploadError) {
      console.error('Evidence upload processing error:', uploadError);
      res.status(500).json({
        success: false,
        message: 'Error processing the uploaded image.',
      });
    }
  });
});

// @route   POST /api/submissions
// @desc    Submit evidence for a challenge
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { challengeId, description, imageUrl } = req.body;

    if (!challengeId || !description || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Challenge ID, description, and evidence image URL are required.',
      });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    // Auto join if not already joined
    const alreadyJoined = challenge.participants.some(p => p.toString() === req.user.id.toString());
    if (!alreadyJoined) {
      challenge.participants.push(req.user.id);
      await challenge.save();
    }

    // Check existing submission
    let submission = await ChallengeSubmission.findOne({
      userId: req.user.id,
      challengeId,
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

      // Allow resubmission if rejected
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

    // New submission
    submission = await ChallengeSubmission.create({
      userId: req.user.id,
      challengeId,
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
      message: 'Evidence submitted successfully! It is now pending administrator verification.',
      submission,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/submissions/me
// @desc    Get all challenge submissions made by the authenticated student
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const submissions = await ChallengeSubmission.find({ userId: req.user.id })
      .populate('challengeId', 'title category difficulty rewardXP icon endDate instructions')
      .sort('-createdAt');

    res.json({
      success: true,
      submissions,
      totalCount: submissions.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
