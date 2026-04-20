import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User as UserIcon,
  ShieldCheck,
  ClipboardList,
  Edit,
  Trophy,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getMyBookings } from "../services/bookingService";
import BadgesPanel from "../components/badges/BadgesPanel";
import ShopperBadgeStatus from "../components/badges/ShopperBadgeStatus";
import MyReviewsPanel from "../components/reviews/MyReviewsPanel";
import CustomerLayout from "../components/dashboard/CustomerLayout";
import OwnerLayout from "../components/dashboard/OwnerLayout";
import AdminLayout from "../components/admin/AdminLayout";

/* ── Tab definitions per role ───────────────────────────────────── */
const CUSTOMER_TABS = [
  { id: "badges", label: "Badges", icon: Trophy },
  { id: "reviews", label: "My Reviews", icon: MessageSquare },
];
const OWNER_TABS = [{ id: "badges", label: "Achievements", icon: Trophy }];

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0 });
  const [activeTab, setActiveTab] = useState("badges");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      getMyBookings()
        .then((data) => {
          setOrderStats({
            total: data.length,
            pending: data.filter((b) => b.status === "pending").length,
          });
        })
        .catch(() => {});
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#051094]" />
      </div>
    );
  }

  const tabs =
    user.role === "CUSTOMER"
      ? CUSTOMER_TABS
      : user.role === "OWNER"
      ? OWNER_TABS
      : [];

  const profileImgSrc = user.profilePicture
    ? user.profilePicture.startsWith("http")
      ? user.profilePicture
      : `http://localhost:5000/${user.profilePicture.replace(/\\/g, "/")}`
    : null;

  const profileContent = (
    <div className="flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl mb-12 transition-all">
        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <div
          className="flex justify-between items-center mb-8 bg-[#051094] p-6 sm:p-8 rounded-3xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #051094 0%, #1a2fd4 100%)" }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">My Profile</h1>
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs py-1 px-3 rounded-full font-semibold border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
              </span>
            </div>
            <p className="text-blue-200 text-sm font-medium">
              Welcome back to Hustle Hub!
            </p>
          </div>
          <button
            onClick={() => navigate("/edit-profile")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* ── Profile Details + Order History Cards ──────────────── */}
        <div
          className={
            user.role === "CUSTOMER"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "flex justify-center"
          }
        >
          {/* Profile Details */}
          <div
            className={`bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#051094]/30 transition-colors shadow-sm ${
              user.role !== "CUSTOMER" ? "w-full max-w-md" : ""
            }`}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="bg-[#051094]/10 p-2 rounded-2xl border border-[#051094]/20 shadow-sm overflow-hidden flex items-center justify-center w-16 h-16">
                {profileImgSrc ? (
                  <img
                    src={profileImgSrc}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-[#051094]" />
                )}
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-0.5">
                  Profile Details
                </h3>
                <p className="text-xl text-gray-900 font-bold">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6 bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg max-w-[55%] truncate">
                  {user.studentEmail || user.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500 font-medium">Phone</span>
                <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                  {user.phone || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500 font-medium">Account Role</span>
                <span className="text-[#051094] font-black bg-[#051094]/10 px-3 py-1 rounded-lg">
                  {user.role}
                </span>
              </div>
              {/* Student ID for non-customers */}
              {user.role !== "CUSTOMER" && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500 font-medium">Student ID</span>
                  <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                    {user.studentId || "N/A"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order History card — customers only */}
          {user.role === "CUSTOMER" && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#051094]/30 transition-colors shadow-sm flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <div className="bg-[#051094]/10 p-3.5 rounded-2xl border border-[#051094]/20 shadow-sm">
                  <ClipboardList className="w-8 h-8 text-[#051094]" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-0.5">
                    Order History
                  </h3>
                  <p className="text-xl text-gray-900 font-bold">My Bookings</p>
                </div>
              </div>
              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 mb-5">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500 font-medium">
                    Total Orders
                  </span>
                  <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                    {orderStats.total}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500 font-medium">Pending</span>
                  <span
                    className="font-bold px-3 py-1 rounded-lg"
                    style={{
                      background:
                        orderStats.pending > 0 ? "#fef3c7" : "#f3f4f6",
                      color: orderStats.pending > 0 ? "#92400e" : "#6b7280",
                    }}
                  >
                    {orderStats.pending}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/orders")}
                className="mt-auto w-full py-3 px-6 bg-[#051094] hover:bg-[#051094]/90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                View Order History
              </button>
            </div>
          )}
        </div>

        {/* ── Shopper Status — customers only ────────────────────── */}
        {user.role === "CUSTOMER" && (
          <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
            <ShopperBadgeStatus userId={user._id} />
          </div>
        )}

        {/* ── Tabbed Panel (Badges / Reviews) ───────────────────── */}
        {tabs.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab Bar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none
                      ${
                        isActive
                          ? "bg-[#051094] text-white shadow-md shadow-[#051094]/20"
                          : "text-gray-500 hover:text-gray-800 hover:bg-white"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              {activeTab === "badges" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <BadgesPanel userId={user._id} role={user.role} />
                </div>
              )}
              {activeTab === "reviews" && user.role === "CUSTOMER" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <MyReviewsPanel />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render with appropriate layout based on role
  switch (user.role) {
    case "ADMIN":
      return (
        <AdminLayout headerTitle="Admin Profile">
          {profileContent}
        </AdminLayout>
      );
    case "OWNER":
      return (
        <OwnerLayout headerTitle="Owner Profile" activeTab="settings">
          {profileContent}
        </OwnerLayout>
      );
    case "CUSTOMER":
    default:
      return (
        <CustomerLayout headerTitle="My Profile" activeTab="settings">
          {profileContent}
        </CustomerLayout>
      );
  }
}