import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import api from '../api/axios';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const username = location.state?.username || '';

  useEffect(() => {
    if (!username) {
      toast.error('No username found. Please register again.', { style: { color: 'red'} });
      navigate('/register');
    }
  }, [username, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { username, otp });
      toast.success(response.data.message || 'OTP verified successfully!', { icon: '✅', style: { color: 'green'} });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed', { icon: '❌', style: { color: 'red'} });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100 transition-all text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#051094]/10 rounded-full">
            <KeyRound className="w-10 h-10 text-[#051094]" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#051094] mb-2">Verify OTP</h2>
        <p className="text-gray-500 mb-8 text-sm">We've extracted your Student ID and sent a 6-digit code to your generated SLIIT email.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input required type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center tracking-[0.25em] text-2xl py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#051094] focus:border-transparent text-gray-900 placeholder-gray-300 outline-none transition-all font-semibold" placeholder="000000" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 px-4 bg-[#051094] hover:bg-[#040c79] text-white rounded-full font-bold transition-all shadow-lg disabled:opacity-70">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
