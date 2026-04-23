import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories, deleteProduct } from '../services/api';
import { Product } from '../types/product';
import AddProductModal from '../components/AddProductModal';
import BulkUploadModal from '../components/BulkUploadModal';
import { Plus, Edit, Trash2, Package, Search, Filter } from 'lucide-react';

const MyInventory: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchInitialData();
    }, []);

    const fetchMyProducts = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getProducts({ 
                created_by: user.username,
                search: search || undefined,
                category_id: selectedCategory || undefined
            });
            setProducts(data);
        } catch (err: any) {
            setError(err.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMyProducts();
        }, search ? 500 : 0);
        return () => clearTimeout(timer);
    }, [user, search, selectedCategory]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteProduct(id);
                fetchMyProducts();
            } catch (err: any) {
                alert(err.message || "Failed to delete product");
            }
        }
    };

    if (loading && products.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading your inventory...</div>;
    }

    return (
        <div className="page-container">
            <style>{`
                @media (max-width: 768px) {
                    .inventory-header { flex-direction: column !important; align-items: stretch !important; gap: 1.5rem !important; }
                    .inventory-header-actions { flex-direction: row !important; }
                    .inventory-header-actions button { flex: 1; padding: 0.75rem !important; font-size: 0.8rem !important; gap: 0.25rem !important; }
                    .filter-bar { flex-direction: column !important; }
                }
            `}</style>

            <div className="inventory-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 950, color: "var(--text-main)", margin: 0 }}>My Inventory</h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.95rem" }}>Manage products you have posted.</p>
                </div>
                <div className="inventory-header-actions" style={{ display: "flex", gap: "1rem" }}>
                    <button 
                        onClick={() => setIsBulkModalOpen(true)}
                        className="btn-primary"
                        style={{ 
                            backgroundColor: "white", 
                            border: "1px solid var(--glass-border)", 
                            color: "var(--text-main)", 
                            boxShadow: "none",
                            background: "white",
                            fontWeight: 700
                        }}
                    >
                        Bulk Upload
                    </button>
                    <button 
                        onClick={() => setIsProductModalOpen(true)}
                        className="btn-primary"
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                        <Plus size={20} /> Add Product
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card filter-bar" style={{ padding: "1.25rem", marginBottom: "2rem", display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 2, minWidth: "200px" }}>
                    <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={16} />
                    <input 
                        className="glass-input"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: "100%", paddingLeft: "40px", backgroundColor: "#f8fafc" }}
                    />
                </div>
                <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                    <Filter style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={16} />
                    <select 
                        className="glass-input"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ width: "100%", paddingLeft: "40px", appearance: "none", backgroundColor: "#f8fafc" }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
            </div>

            {error && <div style={{ color: "#ef4444", marginBottom: "1rem", fontWeight: 600 }}>{error}</div>}

            {products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "white", borderRadius: "1.5rem", border: "1px solid var(--glass-border)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                    <Package size={48} style={{ color: "#cbd5e1", marginBottom: "1rem" }} />
                    <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>No products found.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {products.map(product => (
                        <div key={product.id} className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", backgroundColor: "white" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>{product.name}</h3>
                                <span style={{ backgroundColor: "rgba(37, 99, 235, 0.1)", color: "var(--primary)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>
                                    {product.category_name}
                                </span>
                            </div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem", flex: 1, lineHeight: "1.5" }}>{product.description}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "1rem", marginBottom: "1rem" }}>
                                <span style={{ fontWeight: 900, fontSize: "1.25rem", color: "var(--primary)" }}>${product.price}</span>
                                <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Stock: <strong style={{color: "var(--text-main)"}}>{product.quantity}</strong></span>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button 
                                    onClick={() => handleEdit(product)}
                                    className="btn-primary"
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: "#f1f5f9", 
                                        color: "#475569", 
                                        boxShadow: "none", 
                                        border: "1px solid #e2e8f0", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        gap: "0.5rem",
                                        background: "none",
                                        fontWeight: 600
                                    }}
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(product.id, product.name)}
                                    className="btn-primary"
                                    style={{ 
                                        flex: 2, 
                                        backgroundColor: "#ef4444", 
                                        color: "white", 
                                        boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.3)", 
                                        border: "none", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        gap: "0.5rem",
                                        background: "linear-gradient(to right, #ef4444, #dc2626)"
                                    }}
                                >
                                    <Trash2 size={16} /> Delete Product
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddProductModal 
                isOpen={isProductModalOpen} 
                onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} 
                onSuccess={() => fetchMyProducts()} 
                initialData={editingProduct}
            />
            <BulkUploadModal 
                isOpen={isBulkModalOpen} 
                onClose={() => setIsBulkModalOpen(false)} 
                onSuccess={() => fetchMyProducts()} 
            />
        </div>
    );
};

export default MyInventory;
