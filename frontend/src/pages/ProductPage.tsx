import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductById, updateProduct } from "../services/api";
import { Product } from "../types/product";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";
import PlaceOrderModal from "../components/PlaceOrderModal";
import { ShoppingBag } from "lucide-react";

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE_MANAGER';

    useEffect(() => {
        if (id) {
            getProductById(id)
                .then(setProduct)
                .catch(() => setError("Product not found"))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!product) return;
        const { name, value } = e.target;
        setProduct({ 
            ...product, 
            [name]: name === "price" || name === "quantity" ? parseFloat(value) || 0 : value 
        });
    };

    const [success, setSuccess] = useState("");

    const handleSave = async () => {
        if (!product || !id) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await updateProduct(id, product);
            setSuccess("Product updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to update product. Please check your permissions.");
        } finally {
            setSaving(false);
        }
    };

    const isAuthorized = user?.role === 'ADMIN' || (product?.created_by === user?.username);

    if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
    if (error) return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <ErrorAlert message={error} onClose={() => setError("")} />
            <Link to="/" style={{ color: "#4f46e5", textDecoration: "none" }}>← Back to Inventory</Link>
        </div>
    );
    if (!product) return null;

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <Link to="/" style={{ color: "#4f46e5", textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
                ← Back to Inventory
            </Link>
            
            <div style={{ 
                backgroundColor: "white", 
                padding: "2.5rem", 
                borderRadius: "16px", 
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e2e8f0"
            }}>
                <h2 style={{ color: "#1e293b", marginBottom: "2rem" }}>{isAuthorized ? "Edit Product" : "Product Details"}</h2>
                
                {error && <div style={{ marginBottom: '1.5rem' }}><ErrorAlert message={error} onClose={() => setError("")} /></div>}
                
                {success && (
                    <div style={{ 
                        backgroundColor: '#f0fdf4', 
                        color: '#166534', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        border: '1px solid #bbf7d0',
                        marginBottom: '1.5rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>✅</span> {success}
                    </div>
                )}
                
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>Product Name</label>
                        <input 
                            name="name" 
                            value={product.name} 
                            onChange={handleChange} 
                            readOnly={!isAuthorized}
                            style={{ 
                                width: "100%", 
                                padding: "0.75rem", 
                                borderRadius: "8px", 
                                border: "1px solid #cbd5e1",
                                backgroundColor: isAuthorized ? "white" : "#f8fafc",
                                fontSize: "1rem"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>Brand</label>
                        <input 
                            name="brand" 
                            value={product.brand} 
                            onChange={handleChange} 
                            readOnly={!isAuthorized}
                            style={{ 
                                width: "100%", 
                                padding: "0.75rem", 
                                borderRadius: "8px", 
                                border: "1px solid #cbd5e1",
                                backgroundColor: isAuthorized ? "white" : "#f8fafc",
                                fontSize: "1rem"
                            }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>Price ($)</label>
                            <input 
                                type="number"
                                name="price" 
                                value={product.price} 
                                onChange={handleChange} 
                                readOnly={!isAuthorized}
                                style={{ 
                                    width: "100%", 
                                    padding: "0.75rem", 
                                    borderRadius: "8px", 
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: isAuthorized ? "white" : "#f8fafc",
                                    fontSize: "1rem"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>Quantity</label>
                            <input 
                                type="number"
                                name="quantity" 
                                value={product.quantity} 
                                onChange={handleChange} 
                                readOnly={!isAuthorized}
                                style={{ 
                                    width: "100%", 
                                    padding: "0.75rem", 
                                    borderRadius: "8px", 
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: isAuthorized ? "white" : "#f8fafc",
                                    fontSize: "1rem"
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>Description</label>
                        <textarea 
                            name="description" 
                            value={product.description} 
                            onChange={handleChange} 
                            rows={4}
                            readOnly={!isAuthorized}
                            style={{ 
                                width: "100%", 
                                padding: "0.75rem", 
                                borderRadius: "8px", 
                                border: "1px solid #cbd5e1",
                                backgroundColor: isAuthorized ? "white" : "#f8fafc",
                                fontSize: "1rem",
                                resize: "vertical"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>Category</label>
                        {product.category_id ? (
                            <Link 
                                to={`/category/${product.category_id}`}
                                style={{ 
                                    display: "inline-block",
                                    padding: "0.5rem 1rem", 
                                    borderRadius: "9999px", 
                                    backgroundColor: "#e0e7ff",
                                    color: "#4338ca",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c7d2fe"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e0e7ff"}
                            >
                                {product.category_name || "View Category"}
                            </Link>
                        ) : (
                            <div style={{ 
                                width: "100%", 
                                padding: "0.75rem", 
                                borderRadius: "8px", 
                                border: "1px solid #cbd5e1",
                                backgroundColor: "#f8fafc",
                                fontSize: "1rem",
                                color: "#1e293b"
                            }}>
                                {product.category_name || "Uncategorized"}
                            </div>
                        )}
                    </div>

                    {!isAuthorized && product.created_by && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                            View Only: This product is managed by {product.created_by}
                        </p>
                    )}

                    {isAuthorized && (
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            style={{
                                backgroundColor: "#4f46e5",
                                color: "white",
                                border: "none",
                                padding: "1rem",
                                borderRadius: "10px",
                                fontWeight: 600,
                                fontSize: "1rem",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                                marginTop: "1rem"
                            }}
                        >
                            {saving ? "Saving Changes..." : "Save Product Details"}
                        </button>
                    )}

                    {!isAuthorized && (
                        <button 
                            onClick={() => setIsOrderModalOpen(true)}
                            style={{
                                backgroundColor: "#10b981",
                                color: "white",
                                border: "none",
                                padding: "1rem",
                                borderRadius: "10px",
                                fontWeight: 600,
                                fontSize: "1rem",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                                marginTop: "1rem",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}
                        >
                            <ShoppingBag size={20} /> Place Order
                        </button>
                    )}
                </div>
            </div>

            <PlaceOrderModal 
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                onSuccess={() => setSuccess("Order placed successfully! Track it in the Orders page.")}
                product={{ id: id || "0", name: product.name, price: product.price }}
            />
        </div>
    );
}