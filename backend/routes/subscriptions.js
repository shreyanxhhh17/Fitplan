import express from 'express';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/subscriptions
// @desc    Create a subscription (simulate payment)
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: 'Please provide a plan ID' });
    }

    // Check if plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      plan: planId,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription to this plan' });
    }

    // Calculate expiration date based on plan duration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    // Create subscription (simulating successful payment)
    const subscription = await Subscription.create({
      user: req.user._id,
      plan: planId,
      expiresAt,
      status: 'active'
    });

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('plan')
      .populate('user', 'name email');

    res.status(201).json({ 
      message: 'Subscription created successfully',
      subscription: populatedSubscription 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already have a subscription to this plan' });
    }
    next(error);
  }
});

// @route   GET /api/subscriptions/my-subscriptions
// @desc    Get all subscriptions for the authenticated user
// @access  Private
router.get('/my-subscriptions', protect, async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate({
        path: 'plan',
        populate: {
          path: 'trainer',
          select: 'name email avatar bio certification'
        }
      })
      .sort({ purchaseDate: -1 });

    res.json({ subscriptions });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Get single subscription
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate({
        path: 'plan',
        populate: {
          path: 'trainer',
          select: 'name email avatar bio certification'
        }
      })
      .populate('user', 'name email');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if user owns this subscription
    if (subscription.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this subscription' });
    }

    res.json({ subscription });
  } catch (error) {
    next(error);
  }
});

export default router;

