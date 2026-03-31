import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWarehouseStock, getWarehouse, Warehouse, InventoryStock, adjustStock, getProducts } from '../services/api';
import { Product } from '../types/product';

export default function WarehouseDetail() {
    const { warehouseId } = useParams<{ warehouseId: string }>();
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
    const [stocks, setStocks] = useState<InventoryStock[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [adjustMode, setAdjustMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [type, setType] = useState<'IN' | 'OUT'>('IN');
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!warehouseId) return;
        Promise.all([
            getWarehouse(warehouseId),
            getWarehouseStock(warehouseId),
            getProducts()
        ]).then(([w, s, p]) => {
            setWarehouse(w);
            setStocks(s);
            setProducts(p);
            setLoading(false);
        });
    }, [warehouseId]);

    const handleAdjust = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!warehouseId || !selectedProduct) return;

        try {
            await adjustStock(warehouseId, selectedProduct, quantity, type, remarks);
            // Refresh stock list
            const updatedStock = await getWarehouseStock(warehouseId);
            setStocks(updatedStock);
            setAdjustMode(false);
            // Reset form
            setSelectedProduct('');
            setQuantity(0);
            setRemarks('');
        } catch (err: any) {
            setError(err.message || 'Failed to adjust stock');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading warehouse data...</div>;
    if (!warehouse) return <div style={{ padding: '2rem', textAlign: 'center' }}>Warehouse not found</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/warehouses" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '0.875rem', display: 'block', marginBottom: '1rem' }}>← Back to Warehouses</Link>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>{warehouse.name}</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>{warehouse.location}</p>
                </div>
                <button 
                    onClick={() => setAdjustMode(!adjustMode)}
                    style={{ 
                        backgroundColor: '#4f46e5', 
                        color: 'white', 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '8px', 
                        border: 'none', 
                        fontWeight: 600, 
                        cursor: 'pointer' 
                    }}
                >
                    {adjustMode ? 'Cancel' : 'Record Movement'}
                </button>
            </div>

            {adjustMode && (
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '2rem', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                    marginBottom: '2.5rem',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Record Stock Movement</h3>
                    {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
                    <form onSubmit={handleAdjust} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Product</label>
                            <select 
                                value={selectedProduct} 
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="">Select Product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Quantity</label>
                            <input 
                                type="number" 
                                min="1" 
                                value={quantity} 
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                required
                                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Type</label>
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value as 'IN' | 'OUT')}
                                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="IN">Incoming (IN)</option>
                                <option value="OUT">Outgoing (OUT)</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 3' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Remarks</label>
                            <input 
                                type="text" 
                                value={remarks} 
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Reason for movement..."
                                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <button 
                            style={{ 
                                gridColumn: 'span 3', 
                                backgroundColor: '#10b981', 
                                color: 'white', 
                                padding: '0.75rem', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: 600, 
                                cursor: 'pointer' 
                            }}
                        >
                            Save Movement
                        </button>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Product</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Quantity</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Reorder Threshold</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map(s => {
                            const product = products.find(p => p.id === s.product_id);
                            return (
                                <tr key={s.product_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{product?.name || 'Unknown Product'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{product?.brand}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{s.quantity}</td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{s.reorder_threshold}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {s.quantity <= s.reorder_threshold ? (
                                            <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Low Stock</span>
                                        ) : (
                                            <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Optimal</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {stocks.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No inventory items found in this warehouse.</div>}
            </div>
        </div>
    );
}
