import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && plan?.trainer?._id && plan.trainer.role === 'TRAINER') {
      checkFollowStatus();
    }
  }, [plan, isAuthenticated]);

  const checkFollowStatus = async () => {
    if (!plan?.trainer?._id) return;
    try {
      const res = await api.get(`/follow/check/${plan.trainer._id}`);
      setIsFollowing(res.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const fetchPlan = async () => {
    try {
      const res = await api.get(`/plans/${id}`);
      setPlan(res.data.plan);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/subscriptions', { planId: id });
      alert('Successfully subscribed!');
      fetchPlan();
    } catch (error) {
      alert(error.response?.data?.message || 'Subscription failed');
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!plan?.trainer?._id) return;

    try {
      if (isFollowing) {
        await api.delete(`/follow/${plan.trainer._id}`);
        setIsFollowing(false);
        alert('Unfollowed trainer');
      } else {
        await api.post(`/follow/${plan.trainer._id}`);
        setIsFollowing(true);
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

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
        <div className="h-64 sm:h-80 bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center overflow-hidden relative">
          {plan.image ? (
            <img 
              src={plan.image} 
              alt={plan.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full flex items-center justify-center ${plan.image ? 'hidden' : ''}`}
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 to-indigo-600/80"></div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{plan.title}</h1>
              <div className="flex items-center space-x-2">
                <p className="text-gray-600">
                  by <span className="font-semibold">{plan.trainer?.name || 'Trainer'}</span>
                </p>
                {isAuthenticated && user?.role === 'USER' && plan.trainer?.role === 'TRAINER' && (
                  <button
                    onClick={handleFollow}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      isFollowing
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
            {plan.isSubscribed && (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                Subscribed
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="px-4 py-2 bg-primary-100 rounded-lg">
              <span className="text-2xl font-bold text-primary-700">${plan.price}</span>
              <span className="text-primary-600 text-sm ml-1">/ {plan.duration} days</span>
            </div>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-700">
              {plan.difficulty}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Description</h2>
            <div className={`text-gray-700 leading-relaxed text-sm sm:text-base ${!plan.isSubscribed ? 'blur-sm select-none' : ''}`}>
              {plan.description}
            </div>
            {!plan.isSubscribed && (
              <p className="text-sm text-gray-500 mt-3 italic">
                Subscribe to view full description
              </p>
            )}
          </div>

          {plan.tags && plan.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {plan.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back
            </button>
            {!plan.isSubscribed && (
              <button
                onClick={handleSubscribe}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all font-medium shadow-lg"
              >
                Subscribe Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;

