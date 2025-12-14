import express from 'express';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import { protect, authorize } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();

// @route   GET /api/plans
// @desc    Get all plans (public, with preview for non-subscribers)
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const plans = await Plan.find()
      .populate('trainer', 'name email avatar bio certification')
      .sort({ createdAt: -1 });

    // If user is authenticated, check their subscriptions
    let userSubscriptions = [];
    if (req.user) {
      const subscriptions = await Subscription.find({ 
        user: req.user._id, 
        status: 'active' 
      });
      userSubscriptions = subscriptions.map(sub => sub.plan.toString());
    }

    const plansWithAccess = plans.map(plan => {
      const planObj = plan.toObject();
      const isSubscribed = userSubscriptions.includes(plan._id.toString());
      
      return {
        ...planObj,
        isSubscribed,
        // Hide full description if not subscribed
        description: isSubscribed ? planObj.description : planObj.description.substring(0, 150) + '...'
      };
    });

    res.json({ plans: plansWithAccess });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/plans/:id
// @desc    Get single plan
// @access  Public (with access control)
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('trainer', 'name email avatar bio certification');

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user has subscription
    let isSubscribed = false;
    if (req.user) {
      const subscription = await Subscription.findOne({
        user: req.user._id,
        plan: plan._id,
        status: 'active'
      });
      isSubscribed = !!subscription;
    }

    const planObj = plan.toObject();
    if (!isSubscribed) {
      planObj.description = planObj.description.substring(0, 150) + '...';
    }

    res.json({ 
      plan: {
        ...planObj,
        isSubscribed
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/plans
// @desc    Create a new plan
// @access  Private (Trainer only)
router.post('/', protect, authorize('TRAINER'), async (req, res, next) => {
  try {
    const { title, description, price, duration, image, tags, difficulty } = req.body;

    if (!title || !description || !price || !duration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const plan = await Plan.create({
      title,
      description,
      price,
      duration,
      trainer: req.user._id,
      image: image || '',
      tags: tags || [],
      difficulty: difficulty || 'Beginner'
    });

    const populatedPlan = await Plan.findById(plan._id)
      .populate('trainer', 'name email avatar bio certification');

    res.status(201).json({ plan: populatedPlan });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/plans/:id
// @desc    Update a plan
// @access  Private (Trainer only, own plans)
router.put('/:id', protect, authorize('TRAINER'), async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if plan belongs to the trainer
    if (plan.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this plan' });
    }

    const { title, description, price, duration, image, tags, difficulty } = req.body;

    if (title) plan.title = title;
    if (description) plan.description = description;
    if (price !== undefined) plan.price = price;
    if (duration !== undefined) plan.duration = duration;
    if (image !== undefined) plan.image = image;
    if (tags) plan.tags = tags;
    if (difficulty) plan.difficulty = difficulty;

    await plan.save();

    const updatedPlan = await Plan.findById(plan._id)
      .populate('trainer', 'name email avatar bio certification');

    res.json({ plan: updatedPlan });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/plans/:id
// @desc    Delete a plan
// @access  Private (Trainer only, own plans)
router.delete('/:id', protect, authorize('TRAINER'), async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if plan belongs to the trainer
    if (plan.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this plan' });
    }

    await Plan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/plans/trainer/my-plans
// @desc    Get all plans created by the authenticated trainer
// @access  Private (Trainer only)
router.get('/trainer/my-plans', protect, authorize('TRAINER'), async (req, res, next) => {
  try {
    const plans = await Plan.find({ trainer: req.user._id })
      .populate('trainer', 'name email avatar bio certification')
      .sort({ createdAt: -1 });

    // Get subscription counts for engagement metrics
    const plansWithMetrics = await Promise.all(
      plans.map(async (plan) => {
        const subscriptionCount = await Subscription.countDocuments({
          plan: plan._id,
          status: 'active'
        });
        return {
          ...plan.toObject(),
          subscriptionCount
        };
      })
    );

    res.json({ plans: plansWithMetrics });
  } catch (error) {
    next(error);
  }
});

export default router;

