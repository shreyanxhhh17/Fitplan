import express from 'express';
import Follow from '../models/Follow.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/feed/personalized
// @desc    Get personalized feed for authenticated user
// @access  Private
router.get('/personalized', protect, async (req, res, next) => {
  try {
    // Get all trainers the user is following
    const follows = await Follow.find({ follower: req.user._id });
    const trainerIds = follows.map(follow => follow.following);

    if (trainerIds.length === 0) {
      return res.json({ 
        plans: [],
        message: 'Follow some trainers to see their plans in your feed'
      });
    }

    // Get all plans from followed trainers
    const plans = await Plan.find({ trainer: { $in: trainerIds } })
      .populate('trainer', 'name email avatar bio certification')
      .sort({ createdAt: -1 });

    // Get user's active subscriptions
    const subscriptions = await Subscription.find({
      user: req.user._id,
      status: 'active'
    });
    const subscribedPlanIds = subscriptions.map(sub => sub.plan.toString());

    // Enrich plans with subscription status
    const enrichedPlans = plans.map(plan => {
      const planObj = plan.toObject();
      const isSubscribed = subscribedPlanIds.includes(plan._id.toString());
      
      return {
        ...planObj,
        isSubscribed,
        // Show full description if subscribed, preview otherwise
        description: isSubscribed 
          ? planObj.description 
          : planObj.description.substring(0, 150) + '...'
      };
    });

    res.json({ 
      plans: enrichedPlans,
      count: enrichedPlans.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;

