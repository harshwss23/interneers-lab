import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders, approveOrder, Order } from '../services/api';
import { CheckCircle, Clock, Package, MapPin, CreditCard, User } from 'lucide-react';

const Orders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await approveOrder(id);
            // Update local state or re-fetch
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'APPROVED' } : o));
        } catch (err: any) {
            alert(err.message || "Approval failed");
        }
    };

    if (loading && orders.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;
    }

    return (
        <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1e293b" }}>Order Management</h1>
                <p style={{ color: "#64748b" }}>
                    {user?.role === 'WAREHOUSE_MANAGER' 
                        ? "Approve incoming orders for your products." 
                        : "Track your placed orders."}
                </p>
            </div>

            {error && <div style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</div>}

            {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                    <Package size={48} style={{ color: "#cbd5e1", marginBottom: "1rem" }} />
                    <p style={{ color: "#64748b" }}>No orders found.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {orders.map(order => (
                        <div key={order.id} className="premium-card" style={{ padding: "1.5rem", backgroundColor: "white" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#1e293b" }}>Order #{order.id}</h3>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div style={{ 
                                    padding: "6px 12px", 
                                    borderRadius: "20px", 
                                    fontSize: "0.75rem", 
                                    fontWeight: 700,
                                    backgroundColor: order.status === 'APPROVED' ? "#dcfce7" : "#fef9c3",
                                    color: order.status === 'APPROVED' ? "#166534" : "#854d0e",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem"
                                }}>
                                    {order.status === 'APPROVED' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                    {order.status}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                <div>
                                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Product Details</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#334155" }}>
                                        <Package size={16} />
                                        <span style={{ fontWeight: 600 }}>{order.product_name}</span>
                                        <span style={{ color: "#64748b" }}>x {order.quantity}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#334155", marginTop: "0.5rem" }}>
                                        <User size={16} />
                                        <span>Customer: <strong>{order.username}</strong></span>
                                    </div>
                                </div>
                                <div>
                                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Shipping & Payment</p>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "#334155" }}>
                                        <MapPin size={16} style={{ marginTop: "2px" }} />
                                        <span style={{ fontSize: "0.875rem" }}>{order.address}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#334155", marginTop: "0.5rem" }}>
                                        <CreditCard size={16} />
                                        <span style={{ fontSize: "0.875rem" }}>{order.payment_details}</span>
                                    </div>
                                </div>
                            </div>

                            {user?.role === 'WAREHOUSE_MANAGER' && order.status === 'PENDING' && (
                                <button 
                                    onClick={() => handleApprove(order.id)}
                                    className="btn-primary"
                                    style={{ 
                                        width: "100%", 
                                        padding: "0.75rem", 
                                        background: "linear-gradient(to right, #10b981, #059669)",
                                        boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)"
                                    }}
                                >
                                    Approve Order
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
