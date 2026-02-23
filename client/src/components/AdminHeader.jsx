// components/AdminHeader.jsx
import React, { useState } from 'react';

const MaterialIcon = ({ name, size = 20 }) => (
  <span
    className="material-symbols-rounded"
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

const AdminHeader = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-4 sm:px-8 py-3 bg-[#0a0a0f] text-white border-b border-[#2a2a35] shadow-lg">
      {/* Left section - Logo and Dashboard */}
      <div className="flex items-center gap-6">
        <a href="/admin" className="flex items-center gap-2 font-bold text-lg no-underline text-white">
          <span className="w-[32px] h-[32px] bg-[#0000ff] rounded-lg grid place-items-center text-white text-base font-bold shadow-[0_0_10px_rgba(0,0,255,0.5)]">
            A
          </span>
          <span className="text-white">Admin Panel</span>
        </a>
        
        {/* Dashboard breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
          <MaterialIcon name="chevron_right" size={16} />
          <span className="text-white font-medium">Dashboard</span>
        </div>
      </div>

      {/* Center - Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <input 
            type="text"
            placeholder="Search users, orders, products..."
            className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-lg py-2 px-4 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff] transition-all"
          />
          <MaterialIcon name="search" size={18} className="absolute left-3 top-2.5 text-gray-500" />
        </div>
      </div>

      {/* Right section - Admin actions */}
      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        <button className="hidden sm:flex items-center gap-2 bg-[#1a1a24] hover:bg-[#2a2a35] px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition-all">
          <MaterialIcon name="add" size={18} />
          <span>Quick Add</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-[#1a1a24] rounded-lg transition-colors">
          <MaterialIcon name="notifications" size={20} className="text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff4444] rounded-full"></span>
        </button>

        {/* Messages */}
        <button className="relative p-2 hover:bg-[#1a1a24] rounded-lg transition-colors">
          <MaterialIcon name="chat" size={20} className="text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffaa00] rounded-full"></span>
        </button>

        {/* Admin Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 ml-2 p-1 pr-3 hover:bg-[#1a1a24] rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0000ff] to-[#6600ff] flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-white">Admin User</div>
              <div className="text-xs text-gray-500">Super Admin</div>
            </div>
            <MaterialIcon name="expand_more" size={18} className="text-gray-500" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-[#1a1a24] border border-[#2a2a35] rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-[#2a2a35]">
                  <div className="text-sm font-medium text-white">Admin User</div>
                  <div className="text-xs text-gray-500">admin@hustlehub.com</div>
                </div>
                
                <div className="p-2">
                  {[
                    { icon: 'person', label: 'My Profile', badge: null },
                    { icon: 'settings', label: 'Settings', badge: null },
                    { icon: 'security', label: 'Security', badge: '2FA' },
                    { icon: 'analytics', label: 'Analytics', badge: 'New' },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href="#"
                      className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a35] hover:text-white rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MaterialIcon name={item.icon} size={18} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-xs bg-[#0000ff] px-2 py-0.5 rounded-full text-white">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                  
                  <div className="border-t border-[#2a2a35] my-2"></div>
                  
                  <a
                    href="#"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-[#ff6b6b] hover:bg-[#2a2a35] rounded-lg transition-colors"
                  >
                    <MaterialIcon name="logout" size={18} />
                    <span>Logout</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;