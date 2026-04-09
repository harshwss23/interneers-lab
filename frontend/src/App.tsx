import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Database, BarChart3, FileText, ShoppingCart, Search, Package as PackageIcon } from "lucide-react";
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
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!isAuthenticated) return null;

  const NavLinks = () => {
    if (user?.role === "ADMIN") {
      return (
        <>
          <Link to="/admin/warehouses" className="nav-link"><LayoutDashboard size={18} /> Global Dashboard</Link>
          <Link to="/analytics" className="nav-link"><BarChart3 size={18} /> Global Analytics</Link>
        </>
      );
    }
    if (user?.role === "WAREHOUSE_MANAGER") {
      return (
        <>
          <Link to="/my-inventory" className="nav-link"><Database size={18} /> My Inventory</Link>
          <Link to="/orders" className="nav-link"><PackageIcon size={18} /> Orders</Link>
          <Link to="/analytics" className="nav-link"><BarChart3 size={18} /> Analytics</Link>
          <Link to="/reports" className="nav-link"><FileText size={18} /> Reports</Link>
        </>
      );
    }
    return (
      <>
        <Link to="/explore" className="nav-link"><Search size={18} /> Explore</Link>
        <Link to="/cart" className="nav-link"><ShoppingCart size={18} /> Cart</Link>
        <Link to="/my-orders" className="nav-link"><FileText size={18} /> My Orders</Link>
      </>
    );
  };

  return (
    <nav style={{ 
      backgroundColor: "rgba(255, 255, 255, 0.95)", 
      height: "var(--navbar-height)",
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      padding: "0 2rem",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <style>{`
        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s ease;
        }
        .nav-link:hover { color: var(--primary); }
        
        @media (max-width: 768px) {
          nav { padding: 0 1rem !important; }
          .desktop-links { display: none !important; }
          .mobile-menu {
            position: absolute;
            top: var(--navbar-height);
            left: 0;
            right: 0;
            background: white;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            border-bottom: 1px solid var(--glass-border);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>

      <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
        <Link to="/" style={{ color: "var(--text-main)", textDecoration: "none", fontWeight: 950, fontSize: "1.25rem", letterSpacing: "-0.025em" }}>
          Interneers<span style={{ color: "var(--primary)" }}>Lab</span>
        </Link>
        <div className="desktop-links" style={{ display: "flex", gap: "2rem" }}>
          <NavLinks />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div className="desktop-links" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "1rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{user?.username}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>{user?.role}</span>
        </div>
        
        {!isMobile && (
          <button 
            onClick={() => { logout(); navigate("/login"); }}
            className="btn-primary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
          >
            <LogOut size={16} /> Logout
          </button>
        )}

        {isMobile && (
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: "none", border: "none", color: "var(--text-main)", cursor: "pointer" }}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}
      </div>

      {isMobile && isMobileMenuOpen && (
        <div className="mobile-menu">
          <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserIcon size={20} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontWeight: 800 }}>{user?.username}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--primary)" }}>{user?.role}</div>
              </div>
            </div>
          </div>
          <NavLinks />
          <button 
            onClick={() => { logout(); navigate("/login"); }}
            className="btn-primary"
            style={{ marginTop: "1rem", width: "100%" }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
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