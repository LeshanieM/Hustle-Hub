import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Homepage from './pages/Homepage';
import NotFoundPage from './pages/NotFoundPage';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import StoreEditor from './pages/owner/StoreEditor';
import Analytics from './pages/admin/Analytics';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && user.role?.toUpperCase() !== requiredRole.toUpperCase()) {
    return <NotFoundPage />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Homepage />} />
        
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Profile */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/landing" 
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          } 
        />


        {/* Temporary Dashboard Routes */}
        <Route 
          path="/owner-dashboard" 
          element={
            <ProtectedRoute requiredRole="OWNER">
              <OwnerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/store-editor" element={<StoreEditor />} />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute requiredRole="OWNER">
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
