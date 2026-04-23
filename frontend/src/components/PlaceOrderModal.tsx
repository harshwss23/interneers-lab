import React, { useState } from 'react';
import { createOrder } from '../services/api';
import { X, Send, CreditCard, MapPin, ShoppingCart } from 'lucide-react';

interface PlaceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: { id: string, name: string, price: number };
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
    const [quantity, setQuantity] = useState(1);
    const [address, setAddress] = useState("");
    const [paymentDetails, setPaymentDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await createOrder({
                product: product.id,
                quantity,
                address,
                payment_details: paymentDetails
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={24} />
                </button>
                
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShoppingCart style={{ color: 'var(--primary)' }} />
                    Place Order
                </h2>
                
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Ordering:</p>
                    <p style={{ margin: '0.25rem 0', fontWeight: 700, fontSize: '1.1rem' }}>{product.name}</p>
                    <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 600 }}>Price: ${product.price}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quantity</label>
                        <input 
                            type="number" 
                            min="1"
                            className="glass-input"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            style={{ width: '100%' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            <MapPin size={14} style={{ marginRight: '4px' }} /> Shipping Address
                        </label>
                        <textarea 
                            className="glass-input"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{ width: '100%', height: '80px', resize: 'none' }}
                            placeholder="Enter your full shipping address"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            <CreditCard size={14} style={{ marginRight: '4px' }} /> Payment Details
                        </label>
                        <input 
                            type="text"
                            className="glass-input"
                            value={paymentDetails}
                            onChange={(e) => setPaymentDetails(e.target.value)}
                            style={{ width: '100%' }}
                            placeholder="e.g. Card ending in 1234, PayPal, etc."
                            required
                        />
                    </div>

                    {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {loading ? "Placing Order..." : <><Send size={18} /> Confirm Order</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PlaceOrderModal;
