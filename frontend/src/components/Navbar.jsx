import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Robust check for Admin role
  const isAdmin = user?.role && (
    Array.isArray(user.role) 
      ? user.role.includes("Admin") 
      : user.role === "Admin"
  );

  // Helper to handle "Explore" click
  const handleExploreClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" onClick={handleExploreClick} className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform"></span>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              LiveBid
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {/* Explore Button */}
            <Link 
              to="/" 
              onClick={handleExploreClick}
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Explore
            </Link>
            
            {user ? (
              <>
                {/* Profile Link - Visible for all logged-in users */}
                <Link 
                  to="/profile" 
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Profile
                </Link>
                
                {/* Admin Panel Link - Only visible for admins */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition"
                  >
                    Admin Panel
                  </Link>
                )}
                
                {/* User Info Section */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
                <Link to="/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;