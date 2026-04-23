import React, { useState, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import AdminHeader from "../components/AdminHeader";
import OwnerHeader from "../components/OwnerHeader";
import CustomerHeader from "../components/CustomerHeader";
import CustomerLayout from "../components/dashboard/CustomerLayout";
import OwnerLayout from "../components/dashboard/OwnerLayout";
import AdminLayout from "../components/admin/AdminLayout";
import Footer from "../components/Footer";
import { Bell, Shield, ShoppingBag, MessageSquare, Info, Star, Save } from "lucide-react";
import { toast } from "react-hot-toast";

const NotificationSettingsPage = () => {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useNotifications();
  const [localPrefs, setLocalPrefs] = useState({});

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleToggle = (key) => {
    setLocalPrefs((prev) => {
      // If key is undefined, it defaults to true (ON), so clicking it should make it false (OFF)
      const currentValue = prev[key] === undefined ? true : prev[key];
      return {
        ...prev,
        [key]: !currentValue,
      };
    });
  };

  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updatePreferences(localPrefs);
      toast.success("Notification settings saved successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save notification settings.");
    } finally {
      setSaving(false);
    }
  };

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

  const sections = [
    {
      id: "system",
      title: "System Notifications",
      description: "Critical updates regarding your account and verification status. These cannot be disabled.",
      items: [
        { key: "SYSTEM_SECURITY", label: "Security & Account", description: "Password changes, login alerts, and security updates.", icon: Shield, required: true },
        { key: "VERIFICATION_UPDATES", label: "Verification Status", description: "Updates on your student or store verification requests.", icon: Info, required: true },
      ]
    },
    {
      id: "customer",
      title: "Customer Activity",
      description: "Preferences for your shopping and support experience.",
      roleScope: ["CUSTOMER", "OWNER"],
      items: [
        { key: "PROMOTIONS", label: "Promotions & Offers", description: "Special deals, new arrivals, and community announcements.", icon: Bell },
        { key: "SUPPORT_MESSAGES", label: "Support Inquiries", description: "Receive updates when support or sellers respond to your messages.", icon: MessageSquare },
      ]
    },
    {
      id: "owner",
      title: "Store Management",
      description: "Operational alerts for your business storefront.",
      roleScope: ["OWNER"],
      items: [
        { key: "NEW_ORDER_ALERTS", label: "New Order Alerts", description: "Get notified immediately when customers place or cancel orders.", icon: ShoppingBag },
        { key: "LOW_STOCK_ALERTS", label: "Low Stock Alerts", description: "Receive alerts when your products fall below the alert threshold.", icon: Info },
        { key: "NEW_REVIEW_ALERTS", label: "Product Reviews", description: "Get notified when customers leave feedback on your products.", icon: Star },
      ]
    },
    {
      id: "admin",
      title: "Platform Administration",
      description: "Management alerts for platform moderation and oversight.",
      roleScope: ["ADMIN"],
      items: [
        { key: "ADMIN_BUSINESS_ALERTS", label: "Store Requests", description: "Notifications for new business verification requests.", icon: ShoppingBag },
        { key: "ADMIN_USER_ALERTS", label: "User Registrations", description: "Notifications for new user verification and audit alerts.", icon: Shield },
      ]
    }
  ];

  // Filter sections based on user role
  const visibleSections = sections.filter(section => 
    !section.roleScope || section.roleScope.includes(user?.role)
  );

  const SettingsContent = (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0">Notification Settings</h1>
          <p className="text-gray-500 mt-2">Personalize your notification experience on Hustle Hub.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 bg-[#0000ff] text-white rounded-xl text-sm font-bold hover:bg-[#051094] transition-all shadow-md hover:-translate-y-0.5 border-none cursor-pointer ${
            saving ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="space-y-6">
        {visibleSections.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-900 m-0">{section.title}</h2>
              <p className="text-sm text-gray-500 mt-1 m-0">{section.description}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map((item) => (
                <div key={item.key} className="p-6 flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0000ff] flex items-center justify-center shrink-0">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 m-0 flex items-center gap-2">
                        {item.label}
                        {item.required && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Always On
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 m-0 leading-relaxed max-w-md">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      disabled={item.required}
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        localPrefs[item.key] !== false ? "bg-[#0000ff]" : "bg-gray-200"
                      } ${item.required ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          localPrefs[item.key] !== false ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (user?.role === "ADMIN") {
    return (
      <AdminLayout headerTitle="Notification Settings">
        <div className="space-y-10">
          {SettingsContent}
          <Footer />
        </div>
      </AdminLayout>
    );
  }

  if (user?.role === "OWNER") {
    return (
      <OwnerLayout activeTab="notifications" headerTitle="Notification Settings">
        <div className="space-y-10">
          {SettingsContent}
          <Footer />
        </div>
      </OwnerLayout>
    );
  }

  if (user?.role === "CUSTOMER") {
    return (
      <CustomerLayout activeTab="notifications" headerTitle="Notification Settings">
        <div className="space-y-10">
          {SettingsContent}
          <Footer />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {renderHeader()}
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {SettingsContent}
      </main>

      <Footer />
    </div>
  );
};

export default NotificationSettingsPage;
