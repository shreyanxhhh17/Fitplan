import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [followedTrainers, setFollowedTrainers] = useState([]);
  const [feedPlans, setFeedPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'trainers') {
        const res = await api.get('/follow/following');
        setFollowedTrainers(res.data.trainers);
      } else if (activeTab === 'feed') {
        const res = await api.get('/feed/personalized');
        setFeedPlans(res.data.plans);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (trainerId) => {
    try {
      await api.post(`/follow/${trainerId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to follow trainer');
    }
  };

  const handleUnfollow = async (trainerId) => {
    try {
      await api.delete(`/follow/${trainerId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unfollow trainer');
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      await api.post('/subscriptions', { planId });
      alert('Successfully subscribed!');
      if (activeTab === 'feed') {
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Subscription failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">My Dashboard</h1>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          {['feed', 'trainers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-semibold text-sm capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Personalized Feed */}
          {activeTab === 'feed' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Personalized Feed</h2>
              {feedPlans.length === 0 ? (
                <div className="text-center py-12 bg-white/50 rounded-xl">
                  <p className="text-gray-500 text-lg mb-4">
                    Follow some trainers to see their plans in your feed
                  </p>
                  <Link
                    to="/"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Browse all plans
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {feedPlans.map((plan) => (
                    <div
                      key={plan._id}
                      className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border-2 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                        plan.isSubscribed ? 'border-green-400' : 'border-gray-200'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{plan.title}</h3>
                          {plan.isSubscribed && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                              Subscribed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          by {plan.trainer?.name || 'Trainer'}
                        </p>
                        <p className="text-gray-600 mb-4 line-clamp-3">{plan.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-primary-600">
                            ${plan.price}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                            {plan.difficulty}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/plans/${plan._id}`}
                            className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                          >
                            View
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
              )}
            </div>
          )}

          {/* Followed Trainers */}
          {activeTab === 'trainers' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Followed Trainers</h2>
              {followedTrainers.length === 0 ? (
                <div className="text-center py-12 bg-white/50 rounded-xl">
                  <p className="text-gray-500 text-lg mb-4">You're not following any trainers yet.</p>
                  <Link
                    to="/"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Browse trainers
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {followedTrainers.map((trainer) => (
                    <div
                      key={trainer._id}
                      className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50 hover:shadow-2xl transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{trainer.name}</h3>
                          <p className="text-sm text-gray-500">{trainer.email}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                          Trainer
                        </span>
                      </div>
                      {trainer.bio && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{trainer.bio}</p>
                      )}
                      <button
                        onClick={() => handleUnfollow(trainer._id)}
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;

