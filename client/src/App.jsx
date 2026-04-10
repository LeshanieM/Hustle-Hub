import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/Homepage";
import NotFoundPage from "./pages/NotFoundPage";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

// Customer Pages
import CustomerProductsPage from "./pages/customer/CustomerProductsPage";
import ProductDetailsPage from "./pages/customer/ProductDetailsPage";
import StorefrontView from "./pages/customer/StorefrontView";
import BrowseStores from "./pages/customer/BrowseStores";
import OwnerOrders from "./pages/owner/OwnerOrders";
import Landing from "./pages/Landing";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import SavedItems from "./pages/customer/SavedItems";
import StoreEditor from "./pages/owner/StoreEditor";
import Analytics from "./pages/admin/Analytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import BusinessDirectory from "./pages/admin/BusinessDirectory";
import UserDirectory from "./pages/admin/UserDirectory";
import SystemHealth from "./pages/admin/SystemHealth";
import AuditLogs from "./pages/admin/AuditLogs";
import OrderHistory from "./pages/OrderHistory";

import ChatBot from "./components/ChatBot";
import RoomBuilder from "./components/RoomBuilder";

// Owner Pages
import OwnerProductsDashboard from "./pages/owner/OwnerProductsDashboard";
import AddProductPage from "./pages/owner/AddProductPage";
import EditProductPage from "./pages/owner/EditProductPage";
import AdminOrders from "./pages/admin/AdminOrders";
import OwnerProductsAlerts from "./pages/owner/OwnerProductsAlerts";

// Admin Pages
import ReviewsDashboard from "./pages/admin/ReviewsDashboard";
import AdminHeader from "./components/AdminHeader";

/**
 * ProtectedRoute — guards routes by authentication and role.
 *
 * @param {string[]} allowedRoles — e.g. ['OWNER'] or ['CUSTOMER','OWNER','ADMIN'].
 *   If omitted, any authenticated user can access the route.
 *   If the user's role is NOT in the list → shows NotFoundPage.
 *   If the user is not logged in at all → redirects to /login.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium">
        Loading...
      </div>
    );

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" />;

  // Role check — case-insensitive comparison
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || "").toUpperCase();
    const allowed = allowedRoles.map((r) => r.toUpperCase());
    if (!allowed.includes(userRole)) {
      return <NotFoundPage />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/hero" element={<Homepage />} />
        {/* ===== PUBLIC AUTH ROUTES ===== */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />

        {/* ===== SHARED (any authenticated user) ===== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
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

        {/* ===== CUSTOMER*/}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "OWNER", "ADMIN"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "OWNER", "ADMIN"]}>
              <BrowseStores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/:storeName"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "OWNER", "ADMIN"]}>
              <StorefrontView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/products/:id"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "OWNER", "ADMIN"]}>
              <ProductDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-items"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "OWNER", "ADMIN"]}>
              <SavedItems />
            </ProtectedRoute>
          }
        />

        {/* ===== OWNER ONLY ===== */}
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/alerts"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerProductsAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-editor"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <StoreEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/products"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerProductsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/products/add"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/products/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/orders"
          element={
            <ProtectedRoute>
              <OwnerOrders />
            </ProtectedRoute>
          }
        />

        {/* ===== ADMIN ONLY ===== */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/businesses"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <BusinessDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system-health"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SystemHealth />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminHeader />
              <ReviewsDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminHeader />
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route path="/room-builder" element={<RoomBuilder />} />

        {/* ===== CATCH-ALL ===== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ChatBot />
    </Router>
  );
}

export default App;
