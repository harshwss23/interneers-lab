import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Package, CircleDollarSign, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductBreakdown {
    name: string;
    price: number;
    quantity: number;
    value: number;
}

interface WarehouseSummary {
    id: string;
    name: string;
    location: string;
    manager_username: string;
    total_value: number;
    total_items: number;
    products: ProductBreakdown[];
}

const AdminWarehouses: React.FC = () => {
    const [summary, setSummary] = useState<WarehouseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/orders/reports/warehouse-summary/', {
                    headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                setSummary(data);
            } catch (err) {
                console.error("Failed to fetch warehouse summary", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <div style={{ padding: "5rem", textAlign: "center" }}>Scanning all operational warehouses...</div>;

    const totalNetworkValue = summary.reduce((acc, curr) => acc + curr.total_value, 0);
    const totalNetworkItems = summary.reduce((acc, curr) => acc + curr.total_items, 0);

    return (
        <div className="page-container">
            <style>{`
                @media (max-width: 768px) {
                    .dashboard-header { margin-bottom: 2rem !important; }
                    .dashboard-title { font-size: 1.75rem !important; }
                    .global-stats { grid-template-columns: 1fr !important; }
                    .warehouse-grid { grid-template-columns: 1fr !important; }
                    .stat-value { font-size: 2rem !important; }
                }
            `}</style>

            <div className="dashboard-header" style={{ marginBottom: "2.5rem" }}>
                <h1 className="dashboard-title" style={{ fontSize: "2.5rem", fontWeight: 950, color: "var(--text-main)" }}>Global Warehouse Oversight</h1>
                <p style={{ color: "var(--text-muted)" }}>Monitoring {summary.length} active facilities across your network.</p>
            </div>

            {/* Global Stats */}
            <div className="global-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "3rem" }}>
                <div className="premium-card" style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ padding: "1rem", borderRadius: "16px", backgroundColor: "rgba(79, 70, 229, 0.1)" }}>
                        <CircleDollarSign size={32} color="var(--primary)" />
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", margin: 0, fontWeight: 700, fontSize: "0.8rem" }}>Network Value</p>
                        <h2 className="stat-value" style={{ fontSize: "2.5rem", fontWeight: 950, margin: 0 }}>${totalNetworkValue.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="premium-card" style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ padding: "1rem", borderRadius: "16px", backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                        <Package size={32} color="#10b981" />
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", margin: 0, fontWeight: 700, fontSize: "0.8rem" }}>Total Units</p>
                        <h2 className="stat-value" style={{ fontSize: "2.5rem", fontWeight: 950, margin: 0 }}>{totalNetworkItems.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Warehouse List */}
            <h3 style={{ marginBottom: "1.5rem", fontWeight: 800 }}>Active Warehouses</h3>
            <div className="warehouse-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
                {summary.map((w) => (
                    <div key={w.id} className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <Building2 color="var(--primary)" />
                                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>{w.name}</h4>
                            </div>
                            <span style={{ fontSize: "0.65rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "0.25rem 0.5rem", borderRadius: "6px", fontWeight: 800 }}>ACTIVE</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
                            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                <MapPin size={14} /> {w.location}
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontStyle: "italic" }}>
                                <User size={14} /> {w.manager_username}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "12px" }}>
                                <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>Inventory Value</p>
                                <p style={{ margin: 0, fontWeight: 900, fontSize: "1rem" }}>${w.total_value.toLocaleString()}</p>
                            </div>
                            <div style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "12px" }}>
                                <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>Total Units</p>
                                <p style={{ margin: 0, fontWeight: 900, fontSize: "1rem" }}>{w.total_items.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Product Breakdown */}
                        <div style={{ marginBottom: "1.5rem", flex: 1 }}>
                            <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>Stock Breakdown</p>
                            <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid #f1f5f9", borderRadius: "8px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9", zIndex: 1 }}>
                                        <tr>
                                            <th style={{ textAlign: "left", padding: "0.5rem" }}>Product</th>
                                            <th style={{ textAlign: "right", padding: "0.5rem" }}>Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {w.products.map((p, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                                                <td style={{ padding: "0.5rem" }}>{p.name}</td>
                                                <td style={{ padding: "0.5rem", textAlign: "right", fontWeight: 700 }}>{p.quantity}</td>
                                            </tr>
                                        ))}
                                        {w.products.length === 0 && (
                                            <tr>
                                                <td colSpan={2} style={{ textAlign: "center", padding: "1rem", color: "var(--text-muted)" }}>No products</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Link to={`/analytics?warehouse_id=${w.id}`} style={{ 
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "0.875rem", borderRadius: "12px", backgroundColor: "rgba(79, 70, 229, 0.05)",
                            textDecoration: "none", color: "var(--primary)", fontWeight: 800,
                            fontSize: "0.9rem", transition: "all 0.2s"
                        }}>
                            View Analytics <ArrowRight size={18} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminWarehouses;
