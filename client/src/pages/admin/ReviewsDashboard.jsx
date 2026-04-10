import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';
import ReviewStatsBar from '../../components/admin/ReviewStatsBar';
import RatingDistribution from '../../components/admin/RatingDistribution';
import FlaggedQueue from '../../components/admin/FlaggedQueue';
import AIPlatformInsight from '../../components/admin/AIPlatformInsight';
import ReviewTable from '../../components/admin/ReviewTable';
import api from '../../api/axios';

const ReviewsDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const sidebarItems = [
    { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
    { label: 'Products Management', icon: 'shopping_bag', path: '/admin/products' },
    { label: 'Order Management', icon: 'receipt_long', path: '/admin/orders' },
    { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
    { label: 'User Directory', icon: 'group', path: '/admin/users' },
    { label: 'Reports', icon: 'analytics', path: '/admin/reports' },
    { label: 'AI Forecasting & Insights', icon: 'auto_graph', path: '/admin/ai-insights' },
    { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [revRes, statsRes] = await Promise.all([
        api.get('/admin/reviews/all'),
        api.get('/admin/reviews/stats')
      ]);

      setReviews(revRes.data);
      setStats(statsRes.data);

      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const executeAction = async (endpoint, method, body = null) => {
    try {
      let res;
      if (method === 'GET') res = await api.get(`/admin/reviews${endpoint}`);
      else if (method === 'POST') res = await api.post(`/admin/reviews${endpoint}`, body);
      else if (method === 'PATCH') res = await api.patch(`/admin/reviews${endpoint}`, body);
      else if (method === 'DELETE') res = await api.delete(`/admin/reviews${endpoint}`, { data: body });

      toast.success(res.data.message || 'Action completed');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <DashboardLayout
      role="Administrator"
      headerTitle="Review Management"
      sidebarItems={sidebarItems}
      TopHeader={AdminHeader}
      loading={loading}
    >
      <Toaster position="top-right" />
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Review Management</h1>
          <p className="text-gray-500 mt-2 font-medium">Monitor, analyze, and moderate all platform reviews.</p>
        </div>

        <ReviewStatsBar stats={stats} />

        <div className="flex flex-col xl:flex-row gap-6 mt-6">
          <div className="w-full xl:w-2/3 flex flex-col">
            <ReviewTable
              reviews={reviews}
              loading={loading}
              onApprove={(id) => executeAction(`/${id}/approve`, 'PATCH')}
              onFlag={(id) => executeAction(`/${id}/flag`, 'PATCH')}
              onDelete={(id) => {
                if (window.confirm('Delete this review permanently?')) executeAction(`/${id}`, 'DELETE');
              }}
              onBulkDelete={(ids) => {
                if (window.confirm(`Delete ${ids.length} reviews permanently?`)) executeAction('/bulk', 'DELETE', { ids });
              }}
              onBulkFlag={(ids) => executeAction('/bulk/flag', 'PATCH', { ids })}
            />
          </div>

          <div className="w-full xl:w-1/3 flex flex-col gap-6">
            <RatingDistribution distribution={stats?.ratingDistribution} total={stats?.totalReviews} />
            <FlaggedQueue refreshKey={refreshKey} />
            <AIPlatformInsight />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewsDashboard;
