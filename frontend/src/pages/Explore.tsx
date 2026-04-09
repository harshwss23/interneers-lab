import { useEffect, useState } from "react";
import { getProducts, getCategories, ProductFilters, addToCart } from "../services/api";
import { Product } from "../types/product";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";
import { ShoppingCart, Search, Filter, ArrowRight } from "lucide-react";

export default function Explore() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [cartLoading, setCartLoading] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    
    // Filters state
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");

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

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, search ? 500 : 0);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, minPrice, maxPrice]);

    const handleAddToCart = async (product: Product) => {
        setCartLoading(product.id);
        try {
            await addToCart(product.id, 1);
            setSuccess(`Added ${product.name} to cart!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to add to cart");
        } finally {
            setCartLoading(null);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ color: "#1e293b", margin: 0, fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.025em" }}>Marketplace</h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", marginTop: "0.5rem" }}>Discover and order products from our verified managers.</p>
                </div>
                <button 
                    onClick={() => navigate('/cart')}
                    className="btn-primary"
                    style={{ 
                        padding: "0.8rem 1.5rem", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.75rem",
                        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                    }}
                >
                    <ShoppingCart size={20} /> View Cart
                </button>
            </div>

            {error && <ErrorAlert message={error} onClose={() => setError("")} />}
            {success && (
                <div style={{ 
                    backgroundColor: "#dcfce7", 
                    color: "#166534", 
                    padding: "1rem", 
                    borderRadius: "12px", 
                    marginBottom: "1.5rem",
                    fontWeight: 600,
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                }}>
                    <ShoppingCart size={18} /> {success}
                </div>
            )}

            {/* Premium Filter Bar */}
            <div style={{ 
                backgroundColor: "white", 
                padding: "1.5rem", 
                borderRadius: "20px", 
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                marginBottom: "3rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1.5rem",
                border: "1px solid #f1f5f9"
            }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 3rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.95rem" }}
                    />
                </div>
                <div>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.95rem", appearance: "none", backgroundColor: "white" }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <input 
                        type="number" 
                        placeholder="Min Price" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.95rem" }}
                    />
                    <input 
                        type="number" 
                        placeholder="Max Price" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.95rem" }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "5rem" }}>
                    <div className="spinner" style={{ border: "4px solid #f1f5f9", borderTop: "4px solid #4f46e5", borderRadius: "50%", width: "50px", height: "50px", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
                </div>
            ) : (
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
                    gap: "2rem" 
                }}>
                    {products.map(p => (
                        <div key={p.id} className="premium-card" style={{ padding: "1.5rem", display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <span style={{ backgroundColor: "#eef2ff", color: "#4f46e5", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>
                                        {p.category_name || "General"}
                                    </span>
                                    <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.25rem" }}>${p.price.toFixed(2)}</span>
                                </div>
                                <Link to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b", fontSize: "1.2rem", fontWeight: 800 }}>{p.name}</h3>
                                </Link>
                                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0.5rem 0", lineHeight: 1.5 }}>{p.description.substring(0, 80)}...</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>By {p.created_by}</span>
                                    <span style={{ fontSize: '0.75rem', color: p.quantity > 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                                        {p.quantity > 0 ? `${p.quantity} In Stock` : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleAddToCart(p)}
                                disabled={p.quantity <= 0 || cartLoading === p.id}
                                className="btn-primary"
                                style={{ 
                                    width: "100%", 
                                    marginTop: "1.5rem", 
                                    padding: "0.85rem",
                                    backgroundColor: p.quantity <= 0 ? "#cbd5e1" : "#4f46e5",
                                    opacity: cartLoading === p.id ? 0.7 : 1
                                }}
                            >
                                {cartLoading === p.id ? "Adding..." : p.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                .premium-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
