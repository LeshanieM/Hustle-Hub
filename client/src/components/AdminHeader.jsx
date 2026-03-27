// components/AdminHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight,
  Search,
  Plus,
  Bell,
  MessageCircle,
  ChevronDown,
  User,
  Settings,
  Shield,
  BarChart3,
  LogOut,
  X,
  ShoppingBag,
} from 'lucide-react';

const AdminHeader = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic here
      console.log('Searching for:', searchQuery);
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-4 sm:px-8 py-[16px] bg-white text-[#0a0a0f] border-b border-[rgba(10,10,15,0.1)] shadow-sm">
      {/* Left section - Logo and Profile */}
      <div className="flex items-center gap-6">
        <Link
          to={user ? '/landing' : '/'}
          className="flex items-center gap-2 font-bold text-lg no-underline text-[#0a0a0f] hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/logo.png"
            alt="Hustle-Hub Logo"
            className="w-[40px] h-[40px] object-contain rounded-lg shadow-sm"
          />
          <span className="hidden sm:inline font-bold">
            <span className="text-[#051094]">Hustle</span>-
            <span className="text-[#33cdff]">Hub</span>
          </span>
        </Link>
      </div>

      <div className="flex-1"></div>

      {/* Right section - Admin actions */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Universal Search Toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
        >
          <Search size={20} className="text-[#6b6860] hover:text-[#0000ff]" />
        </button>

        {/* Quick Actions */}
        <Link
          to="/admin-dashboard"
          className="hidden md:flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#6b6860] hover:text-[#0000ff] no-underline font-medium transition-colors"
        >
          <span>Admin Dashboard</span>
        </Link>

        {/*  <Link
          to="/customer-dashboard"
          className="hidden md:flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#6b6860] hover:text-[#0000ff] no-underline font-medium transition-colors"
        >
          <span>Customer Dashboard</span>
        </Link> */}

        <Link
          to="/admin/products"
          className="hidden md:flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#6b6860] hover:text-[#0000ff] no-underline font-medium transition-colors"
        >
          <ShoppingBag size={18} />
          <span>Products</span>
        </Link>

        <Link
          to="/admin/orders"
          className="hidden md:flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#6b6860] hover:text-[#0000ff] no-underline font-medium transition-colors"
        >
          <BarChart3 size={18} />
          <span>Orders</span>
        </Link>

        <Link
          to="/admin/reviews"
          className="hidden md:flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#6b6860] hover:text-[#0000ff] no-underline font-medium transition-colors mr-2"
        >
          <MessageCircle size={18} />
          <span>Reviews</span>
        </Link>
        <Link
          to="/admin/contact"
          className="hidden md:flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#6b6860] hover:text-[#0000ff] no-underline font-medium transition-colors mr-2"
        >
          <Shield size={18} />
          <span>Support</span>
        </Link>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell size={20} className="text-[#6b6860]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff4444] rounded-full"></span>
        </button>

        {/* Messages */}
        <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <MessageCircle size={20} className="text-[#6b6860]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffaa00] rounded-full"></span>
        </button>

        {/* Admin Profile */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 ml-2 p-1 pr-3 hover:bg-gray-50 rounded-lg transition-colors"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0000ff] to-[#6600ff] flex items-center justify-center text-white font-bold text-sm">
              {getInitials(
                user ? `${user.firstName} ${user.lastName}` : 'Admin User',
              )}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-bold text-[#0a0a0f]">
                {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
              </div>
              <div className="text-xs text-[#6b6860]">
                {user?.role || 'Super Admin'}
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#6b6860] transition-transform duration-200 ${
                isProfileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[rgba(10,10,15,0.1)] rounded-xl shadow-xl z-50 p-2 animate-fadeIn">
              <div className="p-3 border-b border-gray-100 mb-2">
                <div className="text-sm font-bold text-[#0a0a0f]">
                  {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                </div>
                <div className="text-xs text-[#6b6860]">
                  {user?.studentEmail || 'admin@hustlehub.com'}
                </div>
              </div>

              <div className="p-1">
                {[
                  {
                    icon: User,
                    label: 'My Profile',
                    path: '/profile',
                    badge: null,
                  },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex items-center justify-between px-3 py-2 text-sm text-[#6b6860] hover:bg-gray-50 hover:text-[#0a0a0f] rounded-lg transition-colors no-underline"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs bg-[#0000ff] px-2 py-0.5 rounded-full text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}

                <div className="border-t border-gray-100 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#ff4444] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Universal Search Modal */}
      {isSearchOpen && (
        <div className="fixed top-[72px] left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-100 animate-slideDown flex justify-center py-4 px-4 sm:px-8">
          <div className="w-full max-w-3xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pl-10 pr-10 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff]"
                autoFocus
              />
              <Search
                size={20}
                className="absolute left-3 top-3.5 text-gray-400"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminHeader;
