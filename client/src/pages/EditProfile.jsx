import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User as UserIcon,
  Camera,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomerLayout from "../components/dashboard/CustomerLayout";
import OwnerLayout from "../components/dashboard/OwnerLayout";
import AdminLayout from "../components/admin/AdminLayout";

export default function EditProfile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    studentEmail: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        studentEmail: user.studentEmail || "",
      });
      if (user.profilePicture) {
        setPreviewSrc(
          user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000/${user.profilePicture.replace(/\\/g, "/")}`,
        );
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewSrc(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.firstName.trim().length < 2) {
      toast.error("First name must be at least 2 characters");
      setLoading(false);
      return;
    }
    if (formData.lastName.trim().length < 2) {
      toast.error("Last name must be at least 2 characters");
      setLoading(false);
      return;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("phone", formData.phone);
      data.append("studentEmail", formData.studentEmail);
      data.append("removePhoto", removePhoto);

      if (profilePicture) {
        data.append("profilePicture", profilePicture);
      }

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update local storage user data and context
      login({ ...updatedUser, token: localStorage.getItem("token") });

      toast.success("Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const editContent = (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center text-slate-400 hover:text-[#051094] transition-colors mb-6 font-bold uppercase tracking-widest text-[10px] border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft className="w-3 h-3 mr-2" />
        Back to Profile
      </button>

      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-xl">
        <div className="mb-10 border-b border-slate-100 pb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
          <p className="text-slate-400 mt-2 font-medium">
            Update your personal information and profile picture.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer w-32 h-32 rounded-[40px] overflow-hidden border-4 border-[#051094]/5 shadow-lg bg-slate-50 flex items-center justify-center">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-slate-200" />
                )}
                <div className="absolute inset-0 bg-[#051094]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {previewSrc && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewSrc(null);
                    setProfilePicture(null);
                    setRemovePhoto(true);
                  }}
                  className="text-xs text-rose-500 font-bold hover:underline border-none bg-transparent cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Click image to change photo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#051094]/5 focus:border-[#051094] transition-all bg-slate-50 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#051094]/5 focus:border-[#051094] transition-all bg-slate-50 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                name="studentEmail"
                value={formData.studentEmail}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#051094]/5 focus:border-[#051094] transition-all bg-slate-50 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0771234567"
                maxLength="10"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#051094]/5 focus:border-[#051094] transition-all bg-slate-50 font-medium"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#051094] hover:bg-[#0d0db0] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-[#051094]/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] border-none cursor-pointer text-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!user) return null;

  switch (user.role) {
    case "ADMIN":
      return (
        <AdminLayout headerTitle="Edit Profile">
          {editContent}
        </AdminLayout>
      );
    case "OWNER":
      return (
        <OwnerLayout headerTitle="Edit Profile" activeTab="settings">
          {editContent}
        </OwnerLayout>
      );
    case "CUSTOMER":
    default:
      return (
        <CustomerLayout headerTitle="Edit Profile" activeTab="settings">
          {editContent}
        </CustomerLayout>
      );
  }
}
