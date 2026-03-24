import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardHeader = ({ title, showSearch = true }) => {
  const { user } = useAuth();
  
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-8">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
        
        {showSearch && (
          <div className="relative hidden md:block w-80 group">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1111d4] transition-colors text-xl">search</span>
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="pl-11 pr-4 py-2 bg-slate-50 border border-transparent rounded-lg w-full text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#1111d4] focus:bg-white transition-all outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="h-9 w-9 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 hover:text-[#1111d4] transition-all relative cursor-pointer ring-0 outline-none">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-rose-500 rounded-full border border-white"></span>
        </button>

        {/* User Profile Summary */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
           <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
              {user?.studentId || 'STUDENT'}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#1111d4] to-[#051094] flex items-center justify-center text-white font-black text-sm shadow-sm">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
