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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden transition-all">
        <div className="bg-[#051094] p-8 md:p-12 text-white relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Profile</h1>
                <span className="bg-green-400/20 text-green-300 text-xs py-1 px-3 rounded-full flex items-center gap-1 font-bold border border-green-400/30 backdrop-blur-sm">
                  <ShieldCheck className="w-3 h-3" /> Verified Student
                </span>
              </div>
              <p className="text-blue-100/80 font-medium">Manage your personal information and preferences.</p>
            </div>
            <button
              onClick={() => navigate("/edit-profile")}
              className="bg-white text-[#051094] hover:bg-slate-50 flex items-center gap-2 font-black py-3 px-6 rounded-2xl transition-all shadow-lg active:scale-95 border-none cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className={`grid grid-cols-1 ${user.role === "CUSTOMER" ? "lg:grid-cols-2" : ""} gap-10`}>
            {/* Profile Info Card */}
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000/${user.profilePicture.replace(/\\/g, "/")}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-slate-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.firstName} {user.lastName}</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-slate-100 inline-block px-2 py-1 rounded mt-1">{user.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Email Address</span>
                      <span className="text-slate-900 font-black text-sm">{user.studentEmail}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Phone Number</span>
                      <span className="text-slate-900 font-black text-sm">{user.phone || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Student ID</span>
                      <span className="text-slate-900 font-black text-sm">{user.studentId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Member Since</span>
                      <span className="text-slate-900 font-black text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Activity Card */}
            {user.role === "CUSTOMER" && (
              <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-[#051094] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#051094]/20">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                    <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Order Summary</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <p className="text-3xl font-black text-[#051094] mb-1">{orderStats.total}</p>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Total Orders</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <p className={`text-3xl font-black mb-1 ${orderStats.pending > 0 ? 'text-amber-500' : 'text-slate-900'}`}>{orderStats.pending}</p>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Pending</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/orders")}
                  className="mt-auto w-full py-4 bg-[#051094] hover:bg-[#0d0db0] text-white font-black rounded-2xl transition-all shadow-xl shadow-[#051094]/10 active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  View Full Order History
                </button>
              </div>
            )}
          </div>
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
