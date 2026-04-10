import React, { useState, useEffect } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const DelayedSpinner = ({ delay = 1000 }) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!show) return null;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-700">
        <div className="w-12 h-12 border-4 border-[#1111d4] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 font-bold text-slate-400 tracking-wider uppercase text-[10px] animate-pulse">Synchronizing Intelligence...</p>
    </div>
  );
};

const DashboardLayout = ({ 
  children, 
  sidebarItems = [], 
  role = 'Customer', 
  headerTitle = 'Dashboard',
  showSearch = true,
  TopHeader = null,
  loading = false
}) => {
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      {/* Optional Global Top Header */}
      {TopHeader && <TopHeader />}

      <div className={`flex flex-1 overflow-hidden ${TopHeader ? 'pt-[72px]' : ''}`}>
        {/* Sidebar */}
        <DashboardSidebar menuItems={sidebarItems} role={role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
          {/* Dashboard-Specific Header (Search/Profile) */}
          <DashboardHeader title={headerTitle} showSearch={showSearch} hideProfile={!!TopHeader} />

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
            <div className="max-w-7xl mx-auto">
              {loading ? <DelayedSpinner /> : children}
            </div>
            
            {/* Custom scrollbar styles */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #cbd5e1;
              }
            `}</style>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
