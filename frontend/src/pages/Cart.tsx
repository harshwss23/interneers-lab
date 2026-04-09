import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartQuantity, clearCart, createOrder, CartItem } from '../services/api';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

const Cart: React.FC = () => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressData, setAddressData] = useState({ address: '', payment_details: 'Standard Checkout' });
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const data = await getCart();
            setItems(data.items || []);
        } catch (err: any) {
            setError(err.message || "Failed to fetch cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (productId: string, newQty: number) => {
        try {
            await updateCartQuantity(productId, newQty);
            if (newQty <= 0) {
                setItems(items.filter(item => item.product_id !== productId));
            } else {
                setItems(items.map(item => item.product_id === productId ? { ...item, quantity: newQty } : item));
            }
        } catch (err: any) {
            setError(err.message || "Update failed");
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlacing(true);
        setError(null);
        try {
            // Place orders for each item in cart
            for (const item of items) {
                await createOrder({
                    product: item.product_id,
                    quantity: item.quantity,
                    address: addressData.address,
                    payment_details: addressData.payment_details
                });
            }
            await clearCart();
            navigate('/my-orders', { state: { successMessage: "Your orders have been placed successfully!" } });
        } catch (err: any) {
            setError(err.message || "Order placement failed");
        } finally {
            setPlacing(false);
        }
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading your cart...</div>;

    return (
        <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 950, color: "#1e293b", marginBottom: "2rem" }}>Your Cart</h1>

            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "5rem", backgroundColor: "white", borderRadius: "24px", border: "1px dashed #e2e8f0" }}>
                    <ShoppingBag size={64} style={{ color: "#cbd5e1", marginBottom: "1.5rem" }} />
                    <h2 style={{ color: "#475569" }}>Your cart is empty</h2>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: "1.5rem" }}>Go Shopping</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: showAddressForm ? "1fr" : "2fr 1fr", gap: "2rem", alignItems: "start" }}>
                    {!showAddressForm ? (
                        <>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {items.map(item => (
                                    <div key={item.product_id} className="premium-card" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                            <div style={{ width: "60px", height: "60px", borderRadius: "12px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <ShoppingBag size={24} style={{ color: "#94a3b8" }} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{item.product_name}</h3>
                                                <p style={{ color: "#4f46e5", fontWeight: 700, margin: "0.25rem 0" }}>${item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: "8px", padding: "0.25rem" }}>
                                                <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} style={{ border: "none", background: "none", cursor: "pointer", padding: "0.5rem" }}><Minus size={16}/></button>
                                                <span style={{ width: "30px", textAlign: "center", fontWeight: 700 }}>{item.quantity}</span>
                                                <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} style={{ border: "none", background: "none", cursor: "pointer", padding: "0.5rem" }}><Plus size={16}/></button>
                                            </div>
                                            <button onClick={() => handleUpdateQuantity(item.product_id, 0)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={20}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="premium-card" style={{ padding: "2rem", backgroundColor: "white", position: "sticky", top: "100px" }}>
                                <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Summary</h3>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: "#64748b" }}>
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", color: "#64748b" }}>
                                    <span>Shipping</span>
                                    <span style={{ color: "#10b981", fontWeight: 700 }}>FREE</span>
                                </div>
                                <div style={{ borderTop: "2px solid #f1f5f9", paddingTop: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 700, fontSize: "1.25rem" }}>Total</span>
                                    <span style={{ fontWeight: 900, fontSize: "1.25rem", color: "#4f46e5" }}>${total.toFixed(2)}</span>
                                </div>
                                <button 
                                    onClick={() => setShowAddressForm(true)} 
                                    className="btn-primary" 
                                    style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
                                >
                                    Checkout <ArrowRight size={20} style={{ marginLeft: "0.5rem" }} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="premium-card" style={{ padding: "3rem", maxWidth: "600px", margin: "0 auto" }}>
                            <button onClick={() => setShowAddressForm(false)} style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 700, cursor: "pointer", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} /> Back to Cart
                            </button>
                            <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1.5rem" }}>Shipping Details</h2>
                            <form onSubmit={handlePlaceOrder} style={{ display: "grid", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Delivery Address</label>
                                    <div style={{ position: "relative" }}>
                                        <MapPin size={18} style={{ position: "absolute", left: "16px", top: "16px", color: "#94a3b8" }} />
                                        <textarea 
                                            required
                                            value={addressData.address}
                                            onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                                            placeholder="Enter your full delivery address..."
                                            style={{ width: "100%", padding: "1rem 1rem 1rem 3.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", minHeight: "100px", resize: "vertical" }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Payment Details</label>
                                    <div style={{ position: "relative" }}>
                                        <CreditCard size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input 
                                            type="text"
                                            required
                                            value={addressData.payment_details}
                                            onChange={(e) => setAddressData({ ...addressData, payment_details: e.target.value })}
                                            placeholder="Card number or UPI ID"
                                            style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 3.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    disabled={placing}
                                    className="btn-primary" 
                                    style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem", marginTop: "1rem" }}
                                >
                                    {placing ? <Loader2 className="animate-spin" /> : `Place Order • $${total.toFixed(2)}`}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cart;
