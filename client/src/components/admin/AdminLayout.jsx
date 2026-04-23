import React from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import AdminHeader from '../AdminHeader';

const AdminLayout = ({ 
  children, 
  headerTitle = 'Administrative Console', 
  loading = false, 
  showSearch = false 
}) => {
  const adminSidebarItems = [
    { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
    { label: 'Products Management', icon: 'shopping_bag', path: '/admin/products' },
    { label: 'Order Management', icon: 'receipt_long', path: '/admin/orders' },
    { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
    { label: 'User Directory', icon: 'group', path: '/admin/users' },
    { label: 'Review Management', icon: 'rate_review', path: '/admin/reviews' },
    { label: 'FAQ Management', icon: 'quiz', path: '/admin/faqs' },
    { label: 'Reports', icon: 'analytics', path: '/admin/reports' },
    { label: 'AI Forecasting & Insights', icon: 'auto_graph', path: '/admin/ai-insights' },
    { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' },
    { label: 'Support Inbox', icon: 'mail', path: '/admin/contact' },
    { label: 'Notifications', icon: 'notifications', path: '/notifications' },
  ];

  return (
    <DashboardLayout 
      role="Administrator"
      headerTitle={headerTitle}
      sidebarItems={adminSidebarItems}
      TopHeader={AdminHeader}
      loading={loading}
      showSearch={showSearch}
    >
      {children}
    </DashboardLayout>
  );
};

export default AdminLayout;
