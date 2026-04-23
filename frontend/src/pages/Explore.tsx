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

            {/* Category Buttons */}
            <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Filter size={16} /> Browse by Category
                </h3>
                <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem", scrollbarWidth: "none" }}>
                    <button 
                        onClick={() => setSelectedCategory("")}
                        style={{ 
                            padding: "0.6rem 1.25rem", 
                            borderRadius: "100px", 
                            border: "1px solid", 
                            borderColor: selectedCategory === "" ? "var(--primary)" : "#e2e8f0",
                            backgroundColor: selectedCategory === "" ? "var(--primary)" : "white",
                            color: selectedCategory === "" ? "white" : "#64748b",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            whiteSpace: "nowrap"
                        }}
                    >
                        All Products
                    </button>
                    {categories.map(c => (
                        <button 
                            key={c.id}
                            onClick={() => setSelectedCategory(c.id)}
                            style={{ 
                                padding: "0.6rem 1.25rem", 
                                borderRadius: "100px", 
                                border: "1px solid", 
                                borderColor: selectedCategory === c.id ? "var(--primary)" : "#e2e8f0",
                                backgroundColor: selectedCategory === c.id ? "var(--primary)" : "white",
                                color: selectedCategory === c.id ? "white" : "#64748b",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {c.title}
                        </button>
                    ))}
                    <Link 
                        to="/categories" 
                        style={{ 
                            padding: "0.6rem 1.25rem", 
                            borderRadius: "100px", 
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#f8fafc",
                            color: "var(--primary)",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            whiteSpace: "nowrap"
                        }}
                    >
                        View All <ArrowRight size={14} />
                    </Link>
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
