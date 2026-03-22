import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Homepage from './pages/Homepage';
import NotFoundPage from './pages/NotFoundPage';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import Profile from './pages/Profile';
// Customer Pages
import CustomerProductsPage from './pages/customer/CustomerProductsPage';
import ProductDetailsPage from './pages/customer/ProductDetailsPage';

// Owner Pages
import OwnerProductsDashboard from './pages/owner/OwnerProductsDashboard';
import AddProductPage from './pages/owner/AddProductPage';
import EditProductPage from './pages/owner/EditProductPage';

// Admin Pages
import ReviewsDashboard from './pages/admin/ReviewsDashboard';
import AdminHeader from './components/AdminHeader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
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

        {/* ===== CUSTOMER ROUTES ===== */}
        <Route path="/customer/products" element={<CustomerProductsPage />} />
        <Route path="/customer/products/:id" element={<ProductDetailsPage />} />

        {/* ===== OWNER ROUTES ===== */}
        <Route path="/owner/products" element={<OwnerProductsDashboard />} />
        <Route path="/owner/products/add" element={<AddProductPage />} />
        <Route path="/owner/products/edit/:id" element={<EditProductPage />} />
        
        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/admin/reviews" element={
          <ProtectedRoute>
            <AdminHeader />
            <ReviewsDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
