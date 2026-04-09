import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import MyInventory from "./pages/MyInventory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Orders from "./pages/Orders";
import Explore from "./pages/Explore";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import AdminWarehouses from "./pages/AdminWarehouses";
import WarehouseDetail from "./pages/WarehouseDetail";
import AdminDashboard from "./pages/AdminDashboard";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <nav style={{ 
      backgroundColor: "rgba(255, 255, 255, 0.8)", 
      color: "var(--text-main)", 
      padding: "1rem 2rem", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link to="/" style={{ color: "var(--text-main)", textDecoration: "none", fontWeight: 900, fontSize: "1.5rem", letterSpacing: "-0.025em" }}>
          Interneers<span style={{ color: "var(--primary)" }}>Lab</span>
        </Link>
        {user?.role === "ADMIN" ? (
          <>
            <Link to="/admin/warehouses" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>Global Dashboard</Link>
            <Link to="/analytics" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>Global Analytics</Link>
          </>
        ) : user?.role === "WAREHOUSE_MANAGER" ? (
          <>
            <Link to="/my-inventory" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>My Inventory</Link>
            <Link to="/orders" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>Orders</Link>
            <Link to="/analytics" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>Analytics</Link>
            <Link to="/reports" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>Reports</Link>
          </>
        ) : (
          <>
            <Link to="/explore" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>Explore</Link>
            <Link to="/cart" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>Cart</Link>
            <Link to="/my-orders" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>My Orders</Link>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{user?.username}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>{user?.role}</span>
        </div>
        <button 
          onClick={() => { logout(); navigate("/login"); }}
          className="btn-primary"
          style={{ 
            padding: "0.5rem 1.25rem", 
            fontSize: "0.875rem",
            boxShadow: "none"
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role || "")) return <Navigate to="/" />;
  
  return <>{children}</>;
};

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={
          isAuthenticated ? (
            user?.role === "ADMIN" 
              ? <Navigate to="/admin/warehouses" /> 
              : user?.role === "WAREHOUSE_MANAGER"
                ? <Navigate to="/my-inventory" />
                : <Navigate to="/explore" />
          ) : <Landing />
        } />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        <Route path="/product/:id" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
        <Route path="/my-inventory" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}><MyInventory /></ProtectedRoute>} />
        <Route path="/category/:category" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
        
        <Route path="/explore" element={<ProtectedRoute allowedRoles={['USER']}><Explore /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute allowedRoles={['USER']}><Cart /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute allowedRoles={['USER']}><MyOrders /></ProtectedRoute>} />

        <Route path="/orders" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}><Orders /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}><Analytics /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}><Reports /></ProtectedRoute>} />
        <Route path="/admin/warehouses" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminWarehouses /></ProtectedRoute>} />
        <Route path="/warehouse/:warehouseId" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}><WarehouseDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}