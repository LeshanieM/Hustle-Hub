import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardSidebar = ({ menuItems = [], role = 'Customer' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full sticky top-0">
      {/* Logo Section - Aligned with Header height if needed, but kept for context */}
      <div className="p-6 border-b border-slate-100 min-h-[70px] flex items-center">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#1111d4] rounded-lg flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-xl font-bold">rocket_launch</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-[#1111d4] uppercase tracking-[0.15em]">{role} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item, idx) => {
          const content = (
            <>
              <span className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-105`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </>
          );
          
          const classes = (active) => `
            flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group w-full text-left border-none cursor-pointer
            ${active 
              ? 'bg-[#1111d4]/10 text-[#1111d4] font-bold' 
              : 'text-slate-600 hover:bg-slate-100 font-medium'}
          `;

          if (item.onClick) {
            return (
              <button key={idx} onClick={item.onClick} className={classes(item.active)}>
                {content}
              </button>
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => classes(isActive)}
            >
              {content}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="p-4 border-t border-slate-100 space-y-1">
        <NavLink
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>Profile</span>
          </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-medium text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
