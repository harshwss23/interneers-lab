import { useEffect, useState } from "react";
import { getProducts, getCategories, ProductFilters, deleteProduct } from "../services/api";
import { Product } from "../types/product";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";
import AddProductModal from "../components/AddProductModal";
import BulkUploadModal from "../components/BulkUploadModal";

export default function Home() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    
    // Filters state
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [myInventoryOnly, setMyInventoryOnly] = useState(false);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE_MANAGER';
    const isManager = user?.role === 'WAREHOUSE_MANAGER';

    // Fetch categories once
    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch(console.error);
    }, []);

    const fetchProducts = async () => {
        const fetchFilters: ProductFilters = {};
        if (search) fetchFilters.search = search;
        if (selectedCategory) fetchFilters.category_id = selectedCategory;
        if (minPrice) fetchFilters.min_price = parseFloat(minPrice);
        if (maxPrice) fetchFilters.max_price = parseFloat(maxPrice);
        if (isManager && myInventoryOnly) fetchFilters.created_by = user.username;

        setLoading(true);
        try {
            const data = await getProducts(fetchFilters);
            setProducts(Array.isArray(data) ? data : []);
            setError("");
        } catch (err) {
            setError("Unable to fetch products. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch products when filters change (debounced search handled by user input pause)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, search ? 500 : 0);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, minPrice, maxPrice, myInventoryOnly]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (err: any) {
                setError(err.message || "Failed to delete product");
            }
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: "#1e293b", margin: 0, fontWeight: 800 }}>Product Inventory</h1>
                {isManagerOrAdmin && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => setIsBulkModalOpen(true)}
                            style={{ 
                                backgroundColor: 'white', 
                                color: '#4f46e5', 
                                border: '2px solid #4f46e5', 
                                padding: '0.75rem 1.5rem', 
                                borderRadius: '10px', 
                                fontWeight: 600, 
                                cursor: 'pointer'
                            }}
                        >
                            Bulk Upload (CSV)
                        </button>
                        <button 
                            onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                            style={{ 
                                backgroundColor: '#4f46e5', 
                                color: 'white', 
                                border: 'none', 
                                padding: '0.75rem 1.5rem', 
                                borderRadius: '10px', 
                                fontWeight: 600, 
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                            }}
                        >
                            + Add Product
                        </button>
                    </div>
                )}
            </div>

            {error && <ErrorAlert message={error} onClose={() => setError("")} />}

            {/* Filter Bar */}
            <div style={{ 
                backgroundColor: "white", 
                padding: "1.5rem", 
                borderRadius: "16px", 
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                marginBottom: "2rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.25rem",
                border: "1px solid #e2e8f0"
            }}>
                <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Search</label>
                    <input 
                        type="text" 
                        placeholder="Search name, brand..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                </div>
                <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Category</label>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Min Price</label>
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Max Price</label>
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                        />
                    </div>
                </div>
                {isManager && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0' }}>
                        <input 
                            type="checkbox" 
                            id="my-inventory" 
                            checked={myInventoryOnly}
                            onChange={(e) => setMyInventoryOnly(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="my-inventory" style={{ fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>My Inventory Only</label>
                    </div>
                )}
            </div>

            {products.length === 0 && loading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #4f46e5", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
                    <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading products...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    {loading && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '-20px', 
                            right: '0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            backgroundColor: '#e0e7ff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            zIndex: 10
                        }}>
                            <div className="spinner-small" style={{ border: "2px solid #f3f3f3", borderTop: "2px solid #4f46e5", borderRadius: "50%", width: "12px", height: "12px", animation: "spin 1s linear infinite" }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4338ca' }}>Updating...</span>
                        </div>
                    )}
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                        gap: "1.5rem",
                        opacity: loading ? 0.7 : 1,
                        transition: 'opacity 0.2s'
                    }}>
                        {products.length === 0 && !loading && (
                            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                                <p style={{ color: "#64748b", fontSize: "1.1rem" }}>No products match your filters.</p>
                                <button 
                                    onClick={() => { setSearch(""); setSelectedCategory(""); setMinPrice(""); setMaxPrice(""); setMyInventoryOnly(false); }}
                                    style={{ marginTop: "1rem", color: "#4f46e5", background: "none", border: "none", fontWeight: 600, cursor: "pointer" }}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                        {products.map((p) => (
                        <div key={p.id} style={{ 
                            backgroundColor: "white", 
                            padding: "1.5rem", 
                            borderRadius: "16px", 
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                            border: "1px solid #e2e8f0",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            cursor: "pointer",
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }} onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                        }} onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Link to={`/product/${p.id}`} style={{ textDecoration: "none" }}>
                                        <h3 style={{ color: "#1e293b", margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>{p.name}</h3>
                                    </Link>
                                    <span style={{ 
                                        backgroundColor: "#f1f5f9", 
                                        color: "#475569", 
                                        padding: "0.25rem 0.65rem", 
                                        borderRadius: "9999px",
                                        fontSize: "0.65rem",
                                        fontWeight: 700
                                    }}>
                                        {p.category_name || "General"}
                                    </span>
                                </div>
                                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.5rem 0", fontWeight: 500 }}>{p.brand}</p>
                                {isManagerOrAdmin && p.created_by && (
                                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "1rem 0 0 0" }}>
                                        Posted by: <span style={{ color: "#64748b", fontWeight: 600 }}>{p.created_by}</span>
                                    </p>
                                )}
                            </div>
                            
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isManagerOrAdmin ? '1rem' : 0 }}>
                                    <span style={{ fontWeight: 800, color: "#4f46e5", fontSize: "1.2rem" }}>${p.price.toFixed(2)}</span>
                                    <span style={{ fontSize: '0.75rem', color: p.quantity > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                                        {p.quantity} in stock
                                    </span>
                                </div>

                                {isManagerOrAdmin && (
                                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                        {(user?.role === 'ADMIN' || p.created_by === user?.username) ? (
                                            <>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#475569', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }}
                                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #fee2e2', backgroundColor: 'transparent', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>
                                                View Only (Owned by {p.created_by})
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            )}

            <AddProductModal 
                isOpen={isProductModalOpen} 
                onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} 
                onSuccess={() => fetchProducts()} 
                initialData={editingProduct}
            />

            <BulkUploadModal 
                isOpen={isBulkModalOpen} 
                onClose={() => setIsBulkModalOpen(false)} 
                onSuccess={() => fetchProducts()} 
            />
        </div>
    );
}