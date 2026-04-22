import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/api";
import { LayoutGrid, ArrowRight, Package } from "lucide-react";

interface Category {
  id: string;
  title: string;
  description: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError("Failed to fetch categories. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "1.5rem", borderRadius: "12px", maxWidth: "500px", margin: "0 auto" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-main)", marginBottom: "0.5rem", letterSpacing: "-0.025em" }}>
          Explore <span style={{ color: "var(--primary)" }}>Categories</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Browse our wide range of products organized by category.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
        {categories.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", backgroundColor: "white", borderRadius: "24px", border: "2px dashed #e2e8f0" }}>
            <Package size={48} color="#94a3b8" style={{ marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.25rem", color: "#64748b" }}>No categories found</h3>
          </div>
        ) : (
          categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <div className="category-card" style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "24px",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer"
              }}>
                <div style={{ 
                  width: "56px", 
                  height: "56px", 
                  borderRadius: "16px", 
                  backgroundColor: "var(--primary-light)", 
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem"
                }}>
                  <LayoutGrid size={28} />
                </div>
                
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem", color: "#1e293b" }}>
                  {category.title}
                </h3>
                
                <p style={{ color: "#64748b", lineHeight: "1.6", marginBottom: "2rem", flexGrow: 1 }}>
                  {category.description || "Discover a variety of high-quality products in this category."}
                </p>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "var(--primary)", fontSize: "0.9rem" }}>
                  View Products <ArrowRight size={16} />
                </div>

                <style>{`
                  .category-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                    border-color: var(--primary-light);
                  }
                  .category-card:hover h3 {
                    color: var(--primary);
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
