import React, { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import AdminHeader from "../components/AdminHeader";
import OwnerHeader from "../components/OwnerHeader";
import CustomerHeader from "../components/CustomerHeader";
import AdminLayout from "../components/admin/AdminLayout";
import OwnerLayout from "../components/dashboard/OwnerLayout";
import CustomerLayout from "../components/dashboard/CustomerLayout";
import Footer from "../components/Footer";
import { Bell, Check, Trash2, ExternalLink, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "../utils/formatTime";

const NotificationsPage = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const renderHeader = () => {
    switch (user?.role) {
      case "ADMIN":
        return <AdminHeader />;
      case "OWNER":
        return <OwnerHeader />;
      default:
        return <CustomerHeader />;
    }
  };

  const PageContent = (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0">Notifications</h1>
          <p className="text-gray-500 mt-2">Manage your alerts and stay updated with Hustle Hub.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/notification-settings"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors no-underline"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#0000ff] text-white rounded-lg text-sm font-medium hover:bg-[#051094] transition-colors border-none cursor-pointer"
            >
              <Check size={18} />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0000ff] mx-auto"></div>
            <p className="text-gray-500 mt-4 font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              You don't have any notifications right now. Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-6 transition-colors hover:bg-gray-50 flex gap-4 ${
                  !n.isRead ? "bg-blue-50/20" : ""
                }`}
              >
                <div className="shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    !n.isRead ? "bg-[#0000ff] text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    <Bell size={24} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className={`text-base m-0 truncate ${!n.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                      {n.title}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 m-0 leading-relaxed mb-4">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-4">
                    {n.link && (
                      <Link
                        to={n.link}
                        className="flex items-center gap-2 text-sm font-bold text-[#0000ff] no-underline hover:underline"
                      >
                        <ExternalLink size={16} />
                        <span>View Details</span>
                      </Link>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 border-none bg-transparent cursor-pointer p-0"
                      >
                        <Check size={16} />
                        <span>Mark as read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (user?.role === "ADMIN") {
    return (
      <AdminLayout headerTitle="Notifications">
        <div className="space-y-10">
          {PageContent}
          <Footer />
        </div>
      </AdminLayout>
    );
  }

  if (user?.role === "OWNER") {
    return (
      <OwnerLayout activeTab="notifications" headerTitle="Notifications">
        <div className="space-y-10">
          {PageContent}
          <Footer />
        </div>
      </OwnerLayout>
    );
  }

  if (user?.role === "CUSTOMER") {
    return (
      <CustomerLayout activeTab="notifications" headerTitle="Notifications">
        <div className="space-y-10">
          {PageContent}
          <Footer />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {renderHeader()}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {PageContent}
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;
