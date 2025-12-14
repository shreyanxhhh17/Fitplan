import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// Compound index to prevent duplicate subscriptions
subscriptionSchema.index({ user: 1, plan: 1 }, { unique: true });

// Index for efficient queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ plan: 1 });

export default mongoose.model('Subscription', subscriptionSchema);

