import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      login(response.data);
      toast.success('Welcome back!', { icon: '✅', style: { color: 'green'} });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed', { icon: '❌', style: { color: 'red'} });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl justify-center flex font-bold text-[#051094] mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in with your username</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#051094] focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all" placeholder="johndoe123" />
              <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#051094] focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all" placeholder="••••••••" />
              <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-[#051094] hover:bg-[#040c79] text-white rounded-full font-bold transition-all shadow-lg mt-2 disabled:opacity-70">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Don't have an account? <Link to="/register" className="text-[#051094] font-bold hover:underline transition-colors">Register here</Link>
        </p>
      </div>
    </div>
  );
}
