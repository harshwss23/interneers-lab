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
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 950, color: "var(--text-main)" }}>Global Warehouse Oversight</h1>
                <p style={{ color: "var(--text-muted)" }}>Monitoring {summary.length} active facilities across your network.</p>
            </div>

            {/* Global Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "3rem" }}>
                <div className="premium-card" style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ padding: "1rem", borderRadius: "16px", backgroundColor: "rgba(79, 70, 229, 0.1)" }}>
                        <CircleDollarSign size={32} color="var(--primary)" />
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>Total Network Value</p>
                        <h2 style={{ fontSize: "2.5rem", fontWeight: 950, margin: 0 }}>${totalNetworkValue.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="premium-card" style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ padding: "1rem", borderRadius: "16px", backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                        <Package size={32} color="var(--secondary)" />
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>Total Units in Stock</p>
                        <h2 style={{ fontSize: "2.5rem", fontWeight: 950, margin: 0 }}>{totalNetworkItems.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Warehouse List */}
            <h3 style={{ marginBottom: "1.5rem" }}>Active Warehouses</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: "1.5rem" }}>
                {summary.map((w) => (
                    <div key={w.id} className="premium-card" style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <Building2 color="var(--primary)" />
                                <h4 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>{w.name}</h4>
                            </div>
                            <span style={{ fontSize: "0.75rem", backgroundColor: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "6px", fontWeight: 800 }}>ACTIVE</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <MapPin size={16} /> {w.location}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontStyle: "italic" }}>
                                <User size={16} /> {w.manager_username}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>Inventory Value</p>
                                <p style={{ margin: 0, fontWeight: 900 }}>${w.total_value.toLocaleString()}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Units</p>
                                <p style={{ margin: 0, fontWeight: 900 }}>{w.total_items.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Product Breakdown */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>Stock Breakdown</p>
                            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #f1f5f9", borderRadius: "8px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                        <tr>
                                            <th style={{ textAlign: "left", padding: "0.5rem" }}>Product</th>
                                            <th style={{ textAlign: "right", padding: "0.5rem" }}>Stock</th>
                                            <th style={{ textAlign: "right", padding: "0.5rem" }}>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {w.products.map((p, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                                                <td style={{ padding: "0.5rem" }}>{p.name}</td>
                                                <td style={{ padding: "0.5rem", textAlign: "right", fontWeight: 700 }}>{p.quantity}</td>
                                                <td style={{ padding: "0.5rem", textAlign: "right" }}>${p.value.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {w.products.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: "center", padding: "1rem", color: "var(--text-muted)" }}>No products assigned</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Link to={`/analytics?warehouse_id=${w.id}`} style={{ 
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "1rem", borderRadius: "12px", backgroundColor: "rgba(79, 70, 229, 0.05)",
                            textDecoration: "none", color: "var(--primary)", fontWeight: 800,
                            transition: "all 0.2s"
                        }}>
                            View Warehouse Analytics <ArrowRight size={18} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminWarehouses;
