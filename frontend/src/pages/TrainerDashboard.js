import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const TrainerDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    difficulty: 'Beginner',
    tags: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans/trainer/my-plans');
      setPlans(res.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image' && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
        setImagePreview(reader.result);
      };
      
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const planData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        difficulty: formData.difficulty,
        tags: tags,
        image: formData.image || ''
      };
      
      if (editingPlan) {
        await api.put(`/plans/${editingPlan._id}`, planData);
      } else {
        await api.post('/plans', planData);
      }

      setShowForm(false);
      setEditingPlan(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        duration: '',
        difficulty: 'Beginner',
        tags: '',
        image: ''
      });
      setImagePreview(null);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    console.log('Editing plan:', plan);
    setEditingPlan(plan);
    setFormData({
      title: plan.title || '',
      description: plan.description || '',
      price: plan.price ? plan.price.toString() : '',
      duration: plan.duration ? plan.duration.toString() : '',
      difficulty: plan.difficulty || 'Beginner',
      tags: Array.isArray(plan.tags) ? plan.tags.join(', ') : (plan.tags || ''),
      image: plan.image || ''
    });
    setImagePreview(plan.image || null);
    setShowForm(true);
    
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.querySelector('.trainer-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      await api.delete(`/plans/${planId}`);
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete plan');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Trainer Dashboard</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPlan(null);
              setFormData({
                title: '',
                description: '',
                price: '',
                duration: '',
                difficulty: 'Beginner',
                tags: '',
                image: ''
              });
              setImagePreview(null);
            }}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all font-medium shadow-lg"
          >
            {showForm ? 'Cancel' : '+ Create Plan'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="trainer-form bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200/50 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="strength, cardio, weight loss"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Image
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: '' });
                        setImagePreview(null);
                        // Reset file input
                        const fileInput = document.querySelector('input[name="image"]');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">Upload an image for your plan (recommended: 800x600px)</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">My Plans</h2>
        {plans.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-xl">
            <p className="text-gray-500 text-lg">You haven't created any plans yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 hover:shadow-2xl transition-all"
              >
                {plan.image && (
                  <div className="h-40 bg-gradient-to-br from-primary-400 to-indigo-500 overflow-hidden">
                    <img 
                      src={plan.image} 
                      alt={plan.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{plan.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary-600">${plan.price}</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                      {plan.difficulty}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">{plan.subscriptionCount || 0}</span> active subscriptions
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="flex-1 px-4 py-2 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboard;

