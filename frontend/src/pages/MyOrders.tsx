import React, { useEffect, useState } from 'react';
import { getOrders, Order } from '../services/api';
import { useLocation } from 'react-router-dom';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string | null>(location.state?.successMessage || null);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data || []);
        } catch (err: any) {
            setError(err.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle size={18} style={{ color: '#10b981' }} />;
            case 'PENDING': return <Clock size={18} style={{ color: '#f59e0b' }} />;
            default: return <AlertCircle size={18} style={{ color: '#64748b' }} />;
        }
    };

    if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading your orders...</div>;

    return (
        <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 950, color: "#1e293b", marginBottom: "0.5rem" }}>My Orders</h1>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>Track the status of your recent purchases.</p>

            {successMessage && (
                <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "1rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid #bbf7d0", fontWeight: 600 }}>
                    {successMessage}
                </div>
            )}

            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "5rem", backgroundColor: "white", borderRadius: "24px", border: "1px dashed #e2e8f0" }}>
                    <Package size={64} style={{ color: "#cbd5e1", marginBottom: "1.5rem" }} />
                    <h2 style={{ color: "#475569" }}>No orders yet</h2>
                    <p style={{ color: "#94a3b8" }}>Start shopping to see your orders here!</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    {orders.map(order => (
                        <div key={order.id} className="premium-card" style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center" }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>{order.product_name}</h3>
                                <p style={{ color: "#64748b", margin: "0.5rem 0", fontSize: "0.85rem" }}>Quantity: {order.quantity}</p>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Status</p>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                    {getStatusIcon(order.status)}
                                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{order.status}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700 }}>REMARKS</p>
                                <p style={{ margin: "0.25rem 0 0 0", color: "#475569", fontWeight: 600, fontStyle: order.status === 'PENDING' ? 'italic' : 'normal' }}>
                                    {order.status === 'PENDING' ? 'In Progress' : 'Completed'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
