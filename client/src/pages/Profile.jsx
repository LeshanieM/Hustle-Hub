import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import CustomerHeader from '../components/CustomerHeader';
import OwnerHeader from '../components/OwnerHeader';
import Footer from '../components/Footer';

export default function Profile() {
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-[#051094] font-bold">Loading...</div>;
  }

  const renderHeader = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminHeader />;
      case 'OWNER':
        return <OwnerHeader />;
      case 'CUSTOMER':
      default:
        return <CustomerHeader />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {renderHeader()}
      
      <div className="max-w-3xl w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl mt-24 mb-12 transition-all">
        <div className="flex justify-between items-center mb-8 bg-[#051094] p-6 sm:p-8 rounded-3xl shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             My Profile 
              <span className="bg-green-400/20 text-green-300 text-sm py-1 px-3 rounded-full flex items-center gap-1 font-semibold border border-green-400/30">
                <ShieldCheck className="w-4 h-4" /> Verified Student
              </span>
            </h1>
            <p className="text-blue-100 mt-2 font-medium">Welcome back to Hustle Hub!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#051094]/30 transition-colors shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="bg-[#051094]/10 p-3.5 rounded-2xl border border-[#051094]/20 shadow-sm">
                <UserIcon className="w-8 h-8 text-[#051094]" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-0.5">Profile Details</h3>
                <p className="text-xl text-gray-900 font-bold">{user.firstName} {user.lastName}</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6 bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500 font-medium"> Email</span>
                <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">{user.studentEmail}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500 font-medium">Account Role</span>
                <span className="text-[#051094] font-black bg-[#051094]/10 px-3 py-1 rounded-lg">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}
