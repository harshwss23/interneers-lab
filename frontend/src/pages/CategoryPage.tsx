import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import { Product } from "../types/product";

export default function CategoryPage() {
    const { category } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (category) {
            getProducts({ category_id: category })
                .then(setProducts)
                .catch(() => setError("Failed to fetch products for this category"))
                .finally(() => setLoading(false));
        }
    }, [category]);

    if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
    if (error) return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <Link to="/" style={{ color: "#4f46e5", textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
                ← Back to Inventory
            </Link>
            
            <h1 style={{ color: "#1e293b", marginBottom: "2rem", textTransform: "capitalize" }}>
                Category: {category}
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {products.length === 0 && <p>No products found in this category.</p>}
                {products.map((p) => (
                    <div key={p.id} style={{ 
                        backgroundColor: "white", 
                        padding: "1.5rem", 
                        borderRadius: "12px", 
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e2e8f0"
                    }}>
                        <Link to={`/product/${p.id}`} style={{ textDecoration: "none" }}>
                            <h3 style={{ color: "#4f46e5", margin: "0 0 0.5rem 0" }}>{p.name}</h3>
                        </Link>
                        <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0.5rem 0" }}>{p.brand}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                            <span style={{ fontWeight: 700, color: "#1e293b" }}>${p.price.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}