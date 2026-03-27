import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const DashboardLayout = ({ 
  children, 
  sidebarItems = [], 
  role = 'Customer', 
  headerTitle = 'Dashboard',
  showSearch = true,
  TopHeader = null
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
              {children}
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
