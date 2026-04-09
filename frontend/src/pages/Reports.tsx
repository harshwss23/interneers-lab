import React, { useEffect, useState } from 'react';
import { getReportingData, exportReportCSV, Warehouse } from '../services/api';
import { FileText, Download, Filter, Package, AlertCircle, TrendingUp, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'categories' | 'price-segments' | 'at-risk'>('categories');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ min_count: 0, max_count: 1000 });
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('');

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await getReportingData(activeTab, filters, selectedWarehouse);
            setData(res);
        } catch (err: any) {
            setError(err.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role);
        if (user.role === 'ADMIN') {
            fetch('/api/warehouses/', { headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }})
                .then(r => r.json()).then(json => setWarehouses(json.data || []));
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [activeTab, selectedWarehouse]);

    const handleExport = async () => {
        try {
            const type = activeTab === 'categories' ? 'inventory' : activeTab === 'at-risk' ? 'low_stock' : 'inventory';
            await exportReportCSV(type, selectedWarehouse);
        } catch (err: any) {
            setError('CSV Export failed');
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 950, color: "var(--text-main)" }}>Advanced Reports</h1>
                    <p style={{ color: "var(--text-muted)" }}>Deep insights into warehouse performance and inventory health.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {userRole === 'ADMIN' && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "white", padding: "0.5rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <Filter size={18} color="var(--primary)" />
                            <select 
                                value={selectedWarehouse} 
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                style={{ border: "none", outline: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                            >
                                <option value="">All (Global)</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button className="btn-primary" onClick={handleExport} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "1rem" }}>
                <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Package size={16}/>} label="Category Distribution" />
                <TabButton active={activeTab === 'price-segments'} onClick={() => setActiveTab('price-segments')} icon={<TrendingUp size={16}/>} label="Price Segmentation" />
                <TabButton active={activeTab === 'at-risk'} onClick={() => setActiveTab('at-risk')} icon={<AlertCircle size={16}/>} label="At-Risk Analysis" />
            </div>

            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            {loading ? (
                <div style={{ padding: "5rem", textAlign: "center", color: "var(--text-muted)" }}>Generating report...</div>
            ) : (
                <div className="premium-card" style={{ padding: "2rem" }}>
                    {activeTab === 'categories' && <CategoryReport data={data} filters={filters} setFilters={setFilters} onRefresh={fetchReport} />}
                    {activeTab === 'price-segments' && <PriceSegmentReport data={data} />}
                    {activeTab === 'at-risk' && <AtRiskReport data={data} />}
                </div>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        style={{
            display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "12px",
            border: "none", cursor: "pointer", transition: "all 0.2s",
            backgroundColor: active ? "var(--primary)" : "transparent",
            color: active ? "white" : "var(--text-muted)",
            fontWeight: 700, fontSize: "0.9rem"
        }}
    >
        {icon} {label}
    </button>
);

const CategoryReport = ({ data, filters, setFilters, onRefresh }: any) => (
    <div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "12px" }}>
            <Filter size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Filter by Count Range:</span>
            <input type="number" value={filters.min_count} onChange={(e) => setFilters({...filters, min_count: parseInt(e.target.value)})} style={{ padding: "0.4rem", borderRadius: "8px", border: "1px solid #e2e8f0", width: "80px" }} />
            <span>to</span>
            <input type="number" value={filters.max_count} onChange={(e) => setFilters({...filters, max_count: parseInt(e.target.value)})} style={{ padding: "0.4rem", borderRadius: "8px", border: "1px solid #e2e8f0", width: "80px" }} />
            <button onClick={onRefresh} className="btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>Apply</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #f1f5f9" }}>
                    <th style={{ padding: "1rem", color: "#64748b" }}>Category Title</th>
                    <th style={{ padding: "1rem", color: "#64748b" }}>Total Unique Products</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(data) && data.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem", fontWeight: 700 }}>{item.category}</td>
                        <td style={{ padding: "1rem" }}>{item.product_count} items</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PriceSegmentReport = ({ data }: any) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
        {Array.isArray(data) && data.map((item: any, i: number) => (
            <div key={i} style={{ padding: "1.5rem", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>{item.segment}</p>
                <h2 style={{ margin: "0.5rem 0 0 0", fontSize: "1.75rem", fontWeight: 900 }}>{item.count} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>products</span></h2>
            </div>
        ))}
    </div>
);

const AtRiskReport = ({ data }: any) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><AlertCircle color="#ef4444" size={20}/> Categories At Risk {'>'}10% Low</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data?.at_risk_categories?.map((c: any, i: number) => (
                    <div key={i} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #fee2e2", backgroundColor: "#fef2f2" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontWeight: 800 }}>{c.category}</span>
                            <span style={{ color: "#ef4444", fontWeight: 800 }}>{c.low_percent}% Low</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#b91c1c" }}>{c.low_count} out of {c.total_count} products are running low.</p>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Navigation color="var(--primary)" size={20}/> Quick Navigate: Low Stock Items</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {data?.low_stock_products?.map((p: any, i: number) => (
                    <Link key={i} to={`/product/${p.id}`} className="premium-card" style={{ padding: "0.75rem 1rem", textDecoration: "none", color: "var(--text-main)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700 }}>{p.name}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Qty: {p.quantity} →</span>
                    </Link>
                ))}
            </div>
        </div>
    </div>
);

export default Reports;
