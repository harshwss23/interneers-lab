import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Warehouses from "./pages/Warehouses";
import WarehouseDetail from "./pages/WarehouseDetail";
import AdminDashboard from "./pages/AdminDashboard";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <nav style={{ 
      backgroundColor: "#1e293b", 
      color: "white", 
      padding: "1rem 2rem", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: 700, fontSize: "1.25rem" }}>IMS Lab</Link>
        <Link to="/" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.9rem" }}>Inventory</Link>
        {(user?.role === "ADMIN" || user?.role === "WAREHOUSE_MANAGER") && (
          <Link to="/warehouses" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.9rem" }}>Warehouses</Link>
        )}
        {user?.role === "ADMIN" && (
          <Link to="/admin" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.9rem" }}>Admin Dashboard</Link>
        )}
      </div>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <span style={{ fontSize: "0.875rem", color: "#94a3b8" }}>{user?.username} ({user?.role})</span>
        <button 
          onClick={() => { logout(); navigate("/login"); }}
          style={{ 
            backgroundColor: "#ef4444", 
            color: "white", 
            border: "none", 
            padding: "0.5rem 1rem", 
            borderRadius: "6px", 
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600
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
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Navbar />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
        <Route path="/category/:category" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
        
        <Route path="/warehouses" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}><Warehouses /></ProtectedRoute>} />
        <Route path="/warehouse/:warehouseId" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}><WarehouseDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;