import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Lock, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [idImage, setIdImage] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setIdImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!idImage) {
      toast.error('Please upload your Student ID image', { icon: '❌', style: { color: 'red'} });
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('idImage', idImage);

    try {
      const response = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Registration successful!', { icon: '✅', style: { color: 'green'} });
      navigate('/verify-otp', { state: { username: response.data.username } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed', { icon: '❌', style: { color: 'red'} });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl justify-center flex font-bold text-[#051094] mb-2">Create Account</h2>
          
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#051094] focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all" placeholder="John" />
                <User className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <div className="relative">
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#051094] focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all" placeholder="Doe" />
                <User className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#051094] focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all" placeholder="johndoe123" />
              <User className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#051094] focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all" placeholder="••••••••" />
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Account Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#051094] focus:border-transparent text-gray-900 outline-none transition-all">
              <option value="CUSTOMER">Customer (Buyer)</option>
              <option value="OWNER">Owner (Seller)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload SLIIT Student ID</label>
            <div className="relative flex items-center justify-center w-full mt-1">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-[#051094]/30 border-dashed rounded-2xl cursor-pointer bg-[#051094]/5 hover:bg-[#051094]/10 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 mb-2 text-[#051094]" />
                  <p className="mb-1 text-sm text-[#051094] font-medium">Click to upload Your SLIIT ID Card</p>
                  <p className="text-xs text-gray-500">Auto-extracts SLIIT ID via OCR</p>
                </div>
                <input required type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            {idImage && <p className="mt-2 text-sm text-green-600 flex items-center gap-1"><ImageIcon className="w-4 h-4"/> {idImage.name}</p>}
          </div>

          <div className="bg-[#051094]/5 border border-[#051094]/20 text-[#051094] p-3 rounded-xl text-xs flex mt-2">
            <span className="mr-2 text-base leading-none">ℹ️</span>
            <span>Your verification OTP will be extracted from your ID and automatically sent to your <b>@my.sliit.lk</b> student email inbox.</span>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[#051094] hover:bg-[#040c79] text-white rounded-full font-bold transition-all shadow-lg disabled:opacity-70 mt-4 flex justify-center items-center">
            {loading ? 'Processing OCR...' : 'Register Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account? <Link to="/login" className="text-[#051094] font-bold hover:underline transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
