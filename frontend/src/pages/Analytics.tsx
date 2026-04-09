import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAnalyticsData, Warehouse } from '../services/api';
import { Filter } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics: React.FC = () => {
    const [searchParams] = useSearchParams();
    const initialWarehouse = searchParams.get('warehouse_id') || '';
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>(initialWarehouse);
    const [userRole, setUserRole] = useState<string>('');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await getAnalyticsData(selectedWarehouse);
            setData(res);
        } catch (err: any) {
            setError(err.message || "Failed to load analytics");
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
        fetchStats();
    }, [selectedWarehouse]);

    if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Analyzing warehouse data...</div>;
    if (error) return <div style={{ padding: '2rem' }}><ErrorAlert message={error} onClose={() => setError(null)} /></div>;

    const totalValue = data?.inventory_value?.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0) || 0;
    const totalOrders = data?.order_status?.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0) || 0;
    const approvedOrders = data?.order_status?.find((s: any) => s.name === 'APPROVED')?.value || 0;
    const fulfillmentRate = totalOrders > 0 ? Math.round((approvedOrders / totalOrders) * 100) : 0;

    return (
        <div className="page-container">
            <style>{`
                @media (max-width: 768px) {
                    .dashboard-header { flex-direction: column !important; align-items: flex-start !important; gap: 1.5rem !important; }
                    .dashboard-title { fontSize: 1.75rem !important; }
                    .chart-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
            
            <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 className="dashboard-title" style={{ fontSize: "2.5rem", fontWeight: 950, color: "var(--text-main)", marginBottom: "0.5rem" }}>Analytics Dashboard</h1>
                    <p style={{ color: "var(--text-muted)" }}>Operational insights and performance metrics.</p>
                </div>
                {userRole === 'ADMIN' && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", backgroundColor: "white", padding: "0.5rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0", width: "fit-content" }}>
                        <Filter size={18} color="var(--primary)" />
                        <select 
                            value={selectedWarehouse} 
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                            style={{ border: "none", outline: "none", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", backgroundColor: "transparent" }}
                        >
                            <option value="">All Warehouses (Global)</option>
                            {Array.isArray(warehouses) && warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="responsive-grid" style={{ marginBottom: "2.5rem" }}>
                <StatCard icon={<TrendingUp color="#4f46e5" />} title="Inventory Value" value={`$${totalValue.toLocaleString()}`} subtitle="Total asset value on shelves" />
                <StatCard icon={<Package color="#10b981" />} title="Total Orders" value={totalOrders} subtitle="Across all statuses" />
                <StatCard icon={<AlertTriangle color="#ef4444" />} title="Low Stock Items" value={data?.low_stock?.length || 0} subtitle="Below safety threshold (10)" />
                <StatCard icon={<CheckCircle2 color="#8b5cf6" />} title="Fulfillment Rate" value={`${fulfillmentRate}%`} subtitle="Approved vs Total" />
            </div>

            <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
                {/* ABC Analysis - Profitability */}
                <ChartContainer title="Inventory Value by Category (ABC Analysis)" subtitle="Where the money is tied up">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data?.inventory_value}
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                minAngle={15}
                            >
                                {Array.isArray(data?.inventory_value) && data.inventory_value.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Sales Velocity */}
                <ChartContainer title="Order Velocity (Last 7 Days)" subtitle="How fast things are moving">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data?.sales_velocity}>
                            <defs>
                                <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVel)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Inventory Levels */}
                <ChartContainer title="Critical Low Stock Items" subtitle="Immediate reorder required">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.low_stock} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                            <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" fontSize={9} width={80} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: '#f8fafc'}} />
                            <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Order Breakdown */}
                <ChartContainer title="Order Status Distribution" subtitle="% Pending vs Approved">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.order_status}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30}>
                                {Array.isArray(data?.order_status) && data.order_status.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'APPROVED' ? '#10b981' : entry.name === 'PENDING' ? '#f59e0b' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Products by Category Count */}
                <ChartContainer title="Total Products per Category" subtitle="Diversity of your inventory">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.inventory_value}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Warehouse breakdown (Admin Global Only) */}
                {userRole === 'ADMIN' && !selectedWarehouse && (
                    <>
                        <ChartContainer title="Orders per Warehouse" subtitle="Fulfillment demand distribution">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data?.orders_per_warehouse}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>

                        <ChartContainer title="Inventory Value by Warehouse" subtitle="Total asset distribution">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data?.warehouse_value}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name }) => name}
                                        minAngle={15}
                                    >
                                        {Array.isArray(data?.warehouse_value) && data.warehouse_value.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subtitle }: any) => (
    <div className="premium-card" style={{ padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "12px" }}>{icon}</div>
        <div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b", fontWeight: 600 }}>{title}</p>
            <h3 style={{ margin: "0.25rem 0", fontSize: "1.5rem", fontWeight: 800 }}>{value}</h3>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{subtitle}</p>
        </div>
    </div>
);

const ChartContainer = ({ title, subtitle, children }: any) => (
    <div className="premium-card" style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>{title}</h3>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>{subtitle}</p>
        </div>
        {children}
    </div>
);

export default Analytics;
