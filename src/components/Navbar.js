import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-indigo-700 transition-all">
              FitPlanHub
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'TRAINER' ? (
                  <Link
                    to="/trainer/dashboard"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/user/dashboard"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-100 to-indigo-100 text-primary-700 border border-primary-200">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl hover:from-primary-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

