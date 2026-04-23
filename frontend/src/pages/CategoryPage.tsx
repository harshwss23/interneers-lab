import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import { Product } from "../types/product";
import { ArrowLeft, ShoppingBag, Tag, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  title: string;
  description: string;
}

export default function CategoryPage() {
    const { category: categoryId } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (categoryId) {
            setProducts([]);
            setLoading(true);
            
            // Fetch category details to get the title
            getCategories().then(cats => {
                const found = cats.find(c => c.id === categoryId);
                if (found) setCategory(found);
            }).catch(console.error);

            getProducts({ category_id: categoryId })
                .then(setProducts)
                .catch(() => setError("Failed to fetch products for this category"))
                .finally(() => setLoading(false));
        }
    }, [categoryId]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <div className="loader">Loading products...</div>
            </div>
        );
    }

    const displayName = category?.title || categoryId;

    return (
        <div style={{ padding: "3rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.9rem" }}>
                <Link to="/categories" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Categories</Link>
                <ChevronRight size={14} color="var(--text-muted)" />
                <span style={{ color: "var(--primary)", fontWeight: 700 }}>{displayName}</span>
            </div>

            <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 950, color: "var(--text-main)", marginBottom: "0.5rem", textTransform: "capitalize" }}>
                        {displayName} <span style={{ color: "var(--primary)" }}>Products</span>
                    </h1>
                    <p style={{ color: "var(--text-muted)" }}>
                        {category?.description || `Showing ${products.length} products available in this category.`}
                    </p>
                </div>
                <Link to="/categories" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ArrowLeft size={18} /> Back to Categories
                </Link>
            </div>

            {error && (
                <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "12px", marginBottom: "2rem" }}>
                    {error}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
                {products.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "5rem", backgroundColor: "white", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
                        <ShoppingBag size={48} color="#94a3b8" style={{ marginBottom: "1rem" }} />
                        <h3 style={{ fontSize: "1.25rem", color: "#64748b" }}>No products found in this category</h3>
                        <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>Check back later or explore other categories.</p>
                    </div>
                ) : (
                    products.map((p) => (
                        <Link 
                            key={p.id} 
                            to={`/product/${p.id}`} 
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <div className="product-card" style={{ 
                                backgroundColor: "white", 
                                padding: "1.5rem", 
                                borderRadius: "20px", 
                                border: "1px solid rgba(0,0,0,0.05)",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                                transition: "all 0.3s ease",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <div style={{ 
                                    aspectRatio: "1/1", 
                                    backgroundColor: "#f8fafc", 
                                    borderRadius: "12px", 
                                    marginBottom: "1.25rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#cbd5e1"
                                }}>
                                    <ShoppingBag size={48} />
                                </div>
                                
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    <Tag size={12} /> {p.brand}
                                </div>
                                
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem", color: "#1e293b", flexGrow: 1 }}>{p.name}</h3>
                                
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
                                    <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-main)" }}>${p.price.toFixed(2)}</span>
                                    <button className="btn-primary" style={{ padding: "0.5rem 0.75rem", borderRadius: "100px", fontSize: "0.8rem" }}>
                                        View Details
                                    </button>
                                </div>

                                <style>{`
                                    .product-card:hover {
                                        transform: translateY(-5px);
                                        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                                        border-color: var(--primary-light);
                                    }
                                `}</style>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}