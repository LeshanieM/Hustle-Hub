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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mt-16">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center text-gray-500 hover:text-[#051094] transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </button>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
          <div className="mb-8 border-b pb-6">
            <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-gray-500 mt-2">
              Update your personal information and profile picture.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-[#051094]/10 shadow-lg bg-gray-50 flex items-center justify-center">
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                    className="text-sm text-red-500 font-semibold hover:underline mt-1"
                  >
                    Remove Photo
                  </button>
                )}
                <p className="text-sm text-gray-500 font-medium text-center">
                  Click image to change photo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#051094]/50 focus:border-[#051094] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#051094]/50 focus:border-[#051094] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#051094]/50 focus:border-[#051094] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0771234567"
                  maxLength="10"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#051094]/50 focus:border-[#051094] transition-all"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#051094] hover:bg-[#051094]/90 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
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
    </div>
  );
}
