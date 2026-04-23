import React, { useEffect, useState } from 'react';
import { getReportingData, exportReportCSV, Warehouse } from '../services/api';
import { FileText, Download, Filter, Package, AlertCircle, TrendingUp, Navigation, ChevronRight, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, Tooltip as ReTooltip 
} from 'recharts';

const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'categories' | 'price-segments' | 'at-risk'>('categories');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ min_count: 0, max_count: 100, exclude: false, threshold: 10 });
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('');

    const fetchReport = async () => {
        setLoading(true);
        setData(null); // Reset data to prevent components from rendering stale/incompatible data
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
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.role);
            if (user.role === 'ADMIN') {
                fetch('/api/warehouses/', { headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }})
                    .then(r => r.json()).then(json => setWarehouses(json.data || []));
            }
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [activeTab, selectedWarehouse, filters.exclude]);

    const handleExport = async () => {
        try {
            const type = activeTab === 'categories' ? 'inventory' : activeTab === 'at-risk' ? 'low_stock' : 'inventory';
            await exportReportCSV(type, selectedWarehouse);
        } catch (err: any) {
            setError('CSV Export failed');
        }
    };

    return (
        <div style={{ padding: "3rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <h1 style={{ fontSize: "3rem", fontWeight: 950, color: "var(--text-main)", letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>
                        Intelligent <span style={{ color: "var(--primary)" }}>Insights</span>
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Advanced data analytics for inventory and warehouse performance.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {userRole === 'ADMIN' && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "white", padding: "0.75rem 1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                            <Filter size={18} color="var(--primary)" />
                            <select 
                                value={selectedWarehouse} 
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                style={{ border: "none", outline: "none", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", backgroundColor: "transparent" }}
                            >
                                <option value="">All Warehouses</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button className="btn-primary" onClick={handleExport} style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.75rem 1.5rem" }}>
                        <Download size={20} /> Export Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem", backgroundColor: "rgba(0,0,0,0.03)", padding: "0.5rem", borderRadius: "20px", width: "fit-content" }}>
                <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Package size={18}/>} label="Inventory Distribution" />
                <TabButton active={activeTab === 'price-segments'} onClick={() => setActiveTab('price-segments')} icon={<TrendingUp size={18}/>} label="Price Segments" />
                <TabButton active={activeTab === 'at-risk'} onClick={() => setActiveTab('at-risk')} icon={<AlertCircle size={18}/>} label="Risk Analysis" />
            </div>

            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            {loading ? (
                <div style={{ padding: "8rem 0", textAlign: "center", color: "var(--text-muted)" }}>
                    <div className="spinner" style={{ marginBottom: "1.5rem" }}></div>
                    <p style={{ fontWeight: 600 }}>Analyzing warehouse data...</p>
                </div>
            ) : (
                <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                    {activeTab === 'categories' && <CategoryReport data={data} filters={filters} setFilters={setFilters} onRefresh={fetchReport} />}
                    {activeTab === 'price-segments' && <PriceSegmentReport data={data} />}
                    {activeTab === 'at-risk' && <AtRiskReport data={data} filters={filters} setFilters={setFilters} onRefresh={fetchReport} />}
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .tab-active { background-color: white !important; color: var(--primary) !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        style={{
            display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1.5rem", borderRadius: "16px",
            border: "none", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            backgroundColor: "transparent",
            color: active ? "var(--primary)" : "#64748b",
            fontWeight: 800, fontSize: "0.95rem"
        }}
        className={active ? 'tab-active' : ''}
    >
        {icon} {label}
    </button>
);

const CategoryReport = ({ data, filters, setFilters, onRefresh }: any) => {
    const chartData = Array.isArray(data) ? data.map(item => ({ name: item.category, count: item.product_count })) : [];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
            <div className="premium-card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}><BarChart2 size={22} color="var(--primary)"/> Category Volume</h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#f8fafc", padding: "0.5rem 1rem", borderRadius: "12px", fontSize: "0.85rem" }}>
                            <span style={{ fontWeight: 700 }}>Exclusive Mode:</span>
                            <input 
                                type="checkbox" 
                                checked={filters.exclude} 
                                onChange={(e) => setFilters({...filters, exclude: e.target.checked})} 
                                style={{ width: "18px", height: "18px", cursor: "pointer" }}
                            />
                            <span style={{ color: "#64748b" }}>{filters.exclude ? "Ignoring Range" : "Showing Only Range"}</span>
                        </div>
                    </div>
                </div>

                <div style={{ height: "400px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 600 }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 600 }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                            />
                            <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="premium-card" style={{ padding: "2rem" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem" }}>Filter Options</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem" }}>Min Product Count</label>
                        <input type="number" value={filters.min_count} onChange={(e) => setFilters({...filters, min_count: parseInt(e.target.value)})} style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem" }}>Max Product Count</label>
                        <input type="number" value={filters.max_count} onChange={(e) => setFilters({...filters, max_count: parseInt(e.target.value)})} style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    </div>
                    <button onClick={onRefresh} className="btn-primary" style={{ width: "100%", padding: "1rem" }}>Apply Filters</button>
                    
                    <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f0f9ff", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#0369a1", lineHeight: 1.5 }}>
                            <strong>Tip:</strong> {filters.exclude ? 
                                `Currently hiding categories that have between ${filters.min_count} and ${filters.max_count} products.` : 
                                `Currently showing only categories that have between ${filters.min_count} and ${filters.max_count} products.`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PriceSegmentReport = ({ data }: any) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="premium-card" style={{ padding: "2rem" }}>
                <h3 style={{ marginBottom: "2rem" }}>Price Segmentation by Category</h3>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "2px solid #f1f5f9" }}>
                                <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.9rem" }}>Category</th>
                                <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.9rem" }}>Budget ($0-50)</th>
                                <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.9rem" }}>Mid-Range ($51-200)</th>
                                <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.9rem" }}>Premium ($201-1k)</th>
                                <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.9rem" }}>Luxury ($1k+)</th>
                                <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.9rem" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(data) && data.map((item: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <Link 
                                            to={item.category_id ? `/category/${item.category_id}` : '#'} 
                                            style={{ fontWeight: 800, color: "var(--primary)", textDecoration: "none" }}
                                        >
                                            {item.category}
                                        </Link>
                                    </td>
                                    {item.segments?.map((s: any, idx: number) => (
                                        <td key={idx} style={{ padding: "1rem" }}>
                                            <span style={{ 
                                                backgroundColor: s.count > 0 ? "rgba(79, 70, 229, 0.05)" : "transparent",
                                                color: s.count > 0 ? "var(--primary)" : "#cbd5e1",
                                                padding: "4px 10px", borderRadius: "8px", fontWeight: 700
                                            }}>
                                                {s.count}
                                            </span>
                                        </td>
                                    ))}
                                    <td style={{ padding: "1rem", fontWeight: 900 }}>{item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {Array.isArray(data) && data.map((item: any, i: number) => (
                    <div key={i} className="premium-card" style={{ padding: "1.5rem" }}>
                        <h4 style={{ margin: "0 0 1rem 0" }}>{item.category} Distribution</h4>
                        <div style={{ height: "200px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={item.segments?.filter((s:any) => s.count > 0) || []} 
                                        dataKey="count" 
                                        nameKey="segment" 
                                        cx="50%" cy="50%" 
                                        outerRadius={60} 
                                        innerRadius={40}
                                    >
                                        {item.segments?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ReTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
                            {item.segments?.map((s: any, idx: number) => s.count > 0 && (
                                <div key={idx} style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: COLORS[idx % COLORS.length], color: "white" }}>
                                    {s.segment}: {s.count}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AtRiskReport = ({ data, filters, setFilters, onRefresh }: any) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="premium-card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}><AlertCircle color="#ef4444" size={24}/> Categories At Risk</h3>
                    <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700 }}>( {'>'}10% items below threshold )</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {data?.at_risk_categories?.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>No categories currently at risk. Stock levels are healthy!</p>
                    ) : data?.at_risk_categories?.map((c: any, i: number) => (
                        <div key={i} style={{ padding: "1.25rem", borderRadius: "16px", border: "1px solid #fee2e2", backgroundColor: "#fff5f5", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", backgroundColor: "#ef4444" }}></div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <Link 
                                    to={c.category_id ? `/category/${c.category_id}` : '#'} 
                                    style={{ fontWeight: 900, fontSize: "1.1rem", color: "#991b1b", textDecoration: "none" }}
                                >
                                    {c.category}
                                </Link>
                                <span style={{ backgroundColor: "#ef4444", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 800 }}>{c.low_percent}% Critical</span>
                            </div>
                            <div style={{ width: "100%", height: "8px", backgroundColor: "#fee2e2", borderRadius: "4px", margin: "1rem 0" }}>
                                <div style={{ width: `${c.low_percent}%`, height: "100%", backgroundColor: "#ef4444", borderRadius: "4px" }}></div>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "#b91c1c", fontWeight: 600 }}>{c.low_count} out of {c.total_count} products are running low.</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="premium-card" style={{ padding: "2rem" }}>
                <h3 style={{ marginBottom: "1.5rem" }}>Threshold Setting</h3>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem" }}>Low Stock Threshold</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <input 
                        type="number" 
                        value={filters.threshold} 
                        onChange={(e) => setFilters({...filters, threshold: parseInt(e.target.value)})} 
                        style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", border: "1px solid #e2e8f0" }} 
                    />
                    <button onClick={onRefresh} className="btn-primary" style={{ padding: "0 1.5rem" }}>Update</button>
                </div>
                <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#64748b" }}>Current threshold is <strong>{filters.threshold}</strong> units. Any product with stock below this will be marked as "Low Stock".</p>
            </div>
        </div>

        <div className="premium-card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><Navigation color="var(--primary)" size={24}/> Critical Low Stock Items</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data?.low_stock_products?.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
                        <Package size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
                        <p>No products are currently low on stock.</p>
                    </div>
                ) : data?.low_stock_products?.map((p: any, i: number) => (
                    <Link 
                        key={i} 
                        to={`/product/${p.id}`} 
                        className="report-nav-item" 
                        style={{ 
                            padding: "1rem 1.25rem", 
                            textDecoration: "none", 
                            color: "var(--text-main)", 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            backgroundColor: "white",
                            border: "1px solid #f1f5f9",
                            borderRadius: "16px",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <div>
                            <span style={{ fontWeight: 800, display: "block" }}>{p.name}</span>
                            <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 700 }}>Stock: {p.quantity} units</span>
                        </div>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </Link>
                ))}
            </div>
            <style>{`
                .report-nav-item:hover { transform: translateX(5px); border-color: var(--primary-light); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            `}</style>
        </div>
    </div>
);

export default Reports;
