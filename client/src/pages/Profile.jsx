import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User as UserIcon,
  ShieldCheck,
  ClipboardList,
  Edit,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getMyBookings } from "../services/bookingService";
import CustomerLayout from "../components/dashboard/CustomerLayout";
import OwnerLayout from "../components/dashboard/OwnerLayout";
import AdminLayout from "../components/admin/AdminLayout";

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch order stats for customer
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-[#051094] font-bold">
        Loading...
      </div>
    );
  }

  const profileContent = (
    <div className="flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl mb-12 transition-all">
        <div className="flex justify-between items-center mb-8 bg-[#051094] p-6 sm:p-8 rounded-3xl shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              My Profile
              <span className="bg-green-400/20 text-green-300 text-sm py-1 px-3 rounded-full flex items-center gap-1 font-semibold border border-green-400/30">
                <ShieldCheck className="w-4 h-4" /> Verified Student
              </span>
            </h1>
            <p className="text-blue-100 mt-2 font-medium">
              Welcome back to Hustle Hub!
            </p>
          </div>
          <button
            onClick={() => navigate("/edit-profile")}
            className="bg-white text-[#051094] hover:bg-gray-100 flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm transform active:scale-95 border-none cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div
          className={
            user.role === "CUSTOMER"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "flex justify-center"
          }
        >
          <div
            className={`bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#051094]/30 transition-colors shadow-sm ${user.role !== "CUSTOMER" ? "w-full max-w-md" : ""}`}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="bg-[#051094]/10 p-2 rounded-2xl border border-[#051094]/20 shadow-sm overflow-hidden flex items-center justify-center w-16 h-16">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000/${user.profilePicture.replace(/\\/g, "/")}`}
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
                <span className="text-gray-500 font-medium"> Email</span>
                <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                  {user.studentEmail}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500 font-medium"> Phone</span>
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
      </div>
    </div>
  );

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