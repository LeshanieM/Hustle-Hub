// components/OwnerHeader.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';

const OwnerHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-4 sm:px-8 py-[16px] bg-white text-[#0a0a0f] border-b border-[rgba(10,10,15,0.1)] shadow-sm">
      {/* Left section - Logo */}
      <div className="flex items-center gap-6 shrink-0">
        <Link
          to={user ? '/landing' : '/'}
          className="flex items-center gap-2 font-bold text-lg no-underline text-[#0a0a0f] hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/logo.png"
            alt="Hustle-Hub Logo"
            className="w-[40px] h-[40px] object-contain rounded-lg shadow-sm"
          />
          <span className="font-bold">
            <span className="text-[#051094]">Hustle</span>-
            <span className="text-[#33cdff]">Hub</span>
          </span>
        </Link>
      </div>

      {/* Center Navigation Links */}
      <div className="hidden xl:flex flex-1 items-center justify-center gap-6 text-sm px-8">
        <Link
          to="/owner-dashboard"
          className="text-[#6b6860] hover:text-[#0a0a0f] transition-colors no-underline font-medium"
        >
          Owner Dashboard
        </Link>

        <Link
          to="/store-editor"
          className="text-[#6b6860] hover:text-[#0a0a0f] transition-colors no-underline font-medium"
        >
          My Shop
        </Link>
        <Link
          to="/owner/products"
          className="text-[#6b6860] hover:text-[#0a0a0f] transition-colors no-underline font-medium"
        >
          Products
        </Link>
        <Link
          to="/owner/orders"
          className="text-[#6b6860] hover:text-[#0a0a0f] transition-colors no-underline font-medium"
        >
          Orders
        </Link>
          <Link
          to="/owner/alerts"
          className="text-[#6b6860] hover:text-[#0a0a0f] transition-colors no-underline font-medium"
        >
          Alerts
        </Link>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer">
          <Bell size={20} className="text-[#6b6860]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4444] rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#051094] to-[#0a0a0f] flex items-center justify-center text-white font-bold text-sm border border-gray-200">
              {user?.firstName?.charAt(0) || 'O'}
            </div>
            <ChevronDown size={18} className="text-[#6b6860]" />
          </button>

          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[rgba(10,10,15,0.1)] rounded-xl shadow-xl z-50 p-2">
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <div className="text-sm font-bold text-[#0a0a0f]">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-[#6b6860]">
                    {user?.studentEmail}
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-[#6b6860] hover:bg-gray-50 hover:text-[#0a0a0f] rounded-lg transition-colors no-underline"
                >
                  <User size={18} />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/customer-dashboard"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-[#6b6860] hover:bg-gray-50 hover:text-[#0a0a0f] rounded-lg transition-colors no-underline"
                >
                  <Settings size={18} />
                  <span>Customer Dashboard</span>
                </Link>

                <div className="border-t border-gray-100 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#ff4444] hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default OwnerHeader;
