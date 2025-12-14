import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && plans.length > 0) {
      checkFollowStatuses();
    }
  }, [plans, isAuthenticated]);

  const checkFollowStatuses = async () => {
    const statuses = {};
    for (const plan of plans) {
      if (plan.trainer?._id && plan.trainer.role === 'TRAINER') {
        try {
          const res = await api.get(`/follow/check/${plan.trainer._id}`);
          statuses[plan.trainer._id] = res.data.isFollowing;
        } catch (error) {
          statuses[plan.trainer._id] = false;
        }
      }
    }
    setFollowingStatus(statuses);
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      await api.post('/subscriptions', { planId });
      alert('Successfully subscribed!');
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Subscription failed');
    }
  };

  const handleFollow = async (trainerId, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      const isFollowing = followingStatus[trainerId];
      if (isFollowing) {
        await api.delete(`/follow/${trainerId}`);
        setFollowingStatus({ ...followingStatus, [trainerId]: false });
        alert('Unfollowed trainer');
      } else {
        await api.post(`/follow/${trainerId}`);
        setFollowingStatus({ ...followingStatus, [trainerId]: true });
        alert('Following trainer');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl mb-16 mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div 
          className="relative bg-cover bg-center bg-no-repeat h-[500px] sm:h-[600px] flex items-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your Fitness Journey
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Premium workout plans from certified trainers. Achieve your goals with personalized fitness programs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 text-base sm:text-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all text-base sm:text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section Header */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Explore Our Plans
        </h2>
        <p className="text-gray-600 text-lg">
          Choose from premium fitness programs designed by certified trainers
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border-2 transition-all hover:shadow-2xl hover:-translate-y-1 ${
              plan.isSubscribed ? 'border-green-400' : 'border-gray-200'
            }`}
          >
            <div className="h-48 bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center overflow-hidden relative">
              {plan.image ? (
                <img 
                  src={plan.image} 
                  alt={plan.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.fallback-image');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`fallback-image w-full h-full flex items-center justify-center ${plan.image ? 'hidden absolute inset-0' : ''}`}
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 to-indigo-600/80"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">{plan.title}</h3>
                {plan.isSubscribed && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    Subscribed
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">
                  by <span className="font-semibold">{plan.trainer?.name || 'Trainer'}</span>
                </p>
                {isAuthenticated && user?.role === 'USER' && plan.trainer?.role === 'TRAINER' && (
                  <button
                    onClick={(e) => handleFollow(plan.trainer._id, e)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                      followingStatus[plan.trainer._id]
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {followingStatus[plan.trainer._id] ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{plan.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-primary-600">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    / {plan.duration} days
                  </span>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                  {plan.difficulty}
                </span>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/plans/${plan._id}`}
                  className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  View Details
                </Link>
                {!plan.isSubscribed && (
                  <button
                    onClick={() => handleSubscribe(plan._id)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all font-medium"
                  >
                    Subscribe
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No plans available yet.</p>
        </div>
      )}
    </div>
  );
};

export default Landing;

