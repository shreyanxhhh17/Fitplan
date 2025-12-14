import express from 'express';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/follow/:trainerId
// @desc    Follow a trainer
// @access  Private
router.post('/:trainerId', protect, async (req, res, next) => {
  try {
    const trainerId = req.params.trainerId;

    // Check if trainer exists and is actually a trainer
    const trainer = await User.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    if (trainer.role !== 'TRAINER') {
      return res.status(400).json({ message: 'You can only follow trainer accounts' });
    }

    // Prevent self-follow
    if (trainerId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: trainerId
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'You are already following this trainer' });
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: req.user._id,
      following: trainerId
    });

    res.status(201).json({ 
      message: 'Successfully followed trainer',
      follow 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already following this trainer' });
    }
    next(error);
  }
});

// @route   DELETE /api/follow/:trainerId
// @desc    Unfollow a trainer
// @access  Private
router.delete('/:trainerId', protect, async (req, res, next) => {
  try {
    const trainerId = req.params.trainerId;

    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: trainerId
    });

    if (!follow) {
      return res.status(404).json({ message: 'You are not following this trainer' });
    }

    res.json({ message: 'Successfully unfollowed trainer' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/follow/following
// @desc    Get all trainers the user is following
// @access  Private
router.get('/following', protect, async (req, res, next) => {
  try {
    const follows = await Follow.find({ follower: req.user._id })
      .populate('following', 'name email avatar bio certification role')
      .sort({ createdAt: -1 });

    const trainers = follows.map(follow => follow.following);

    res.json({ trainers });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/follow/followers/:trainerId
// @desc    Get all followers of a trainer
// @access  Public
router.get('/followers/:trainerId', async (req, res, next) => {
  try {
    const trainerId = req.params.trainerId;

    // Verify it's a trainer
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'TRAINER') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const follows = await Follow.find({ following: trainerId })
      .populate('follower', 'name email avatar')
      .sort({ createdAt: -1 });

    const followers = follows.map(follow => follow.follower);

    res.json({ followers });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/follow/check/:trainerId
// @desc    Check if user is following a trainer
// @access  Private
router.get('/check/:trainerId', protect, async (req, res, next) => {
  try {
    const trainerId = req.params.trainerId;

    const follow = await Follow.findOne({
      follower: req.user._id,
      following: trainerId
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    next(error);
  }
});

export default router;

