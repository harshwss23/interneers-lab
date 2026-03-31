import React, { useState, useEffect } from 'react';
import { getCategories, createProduct, updateProduct, createCategory } from '../services/api';
import { Product } from '../types/product';
import ErrorAlert from './ErrorAlert';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Product | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        price: "",
        quantity: "",
        description: "",
        category_id: ""
    });

    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    brand: initialData.brand,
                    price: initialData.price.toString(),
                    quantity: initialData.quantity.toString(),
                    description: initialData.description || "",
                    category_id: initialData.category_id || ""
                });
            } else {
                setFormData({ name: "", brand: "", price: "", quantity: "", description: "", category_id: "" });
            }
        }
    }, [isOpen, initialData]);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateCategory = async () => {
        if (!newCategory.title) {
            setError("Category title is required");
            return;
        }
        setLoading(true);
        try {
            const created = await createCategory(newCategory.title, newCategory.description);
            setCategories([...categories, created]);
            setFormData({ ...formData, category_id: created.id });
            setIsAddingCategory(false);
            setNewCategory({ title: "", description: "" });
            setError("");
        } catch (err: any) {
            // Handle "already exist" message from backend
            setError(err.message || "Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!formData.name || !formData.brand || !formData.price || !formData.quantity) {
            setError("All fields except description are required");
            return;
        }

        setLoading(true);
        try {
            const productData = {
                name: formData.name,
                brand: formData.brand,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                description: formData.description,
                category_id: formData.category_id || undefined
            };

            if (isEdit && initialData) {
                await updateProduct(initialData.id, productData);
            } else {
                await createProduct(productData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState({ title: "", description: "" });

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                </div>

                {error && <ErrorAlert message={error} onClose={() => setError("")} />}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Product Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="iPhone 15" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Brand</label>
                            <input name="brand" value={formData.brand} onChange={handleChange} required style={inputStyle} placeholder="Apple" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Price ($)</label>
                            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required style={inputStyle} placeholder="99.99" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Initial Quantity</label>
                            <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} required style={inputStyle} placeholder="10" />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Category</label>
                        {!isAddingCategory ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select 
                                    name="category_id" 
                                    value={formData.category_id} 
                                    onChange={handleChange} 
                                    style={{ ...inputStyle, flex: 1 }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddingCategory(true)}
                                    style={{ padding: '0 1rem', borderRadius: '8px', border: '1px solid #4f46e5', color: '#4f46e5', backgroundColor: 'transparent', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    + New
                                </button>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <input 
                                        placeholder="Category Name" 
                                        value={newCategory.title}
                                        onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="button" onClick={handleCreateCategory} disabled={loading} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        Create & Select
                                    </button>
                                    <button type="button" onClick={() => setIsAddingCategory(false)} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Product details..." />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box' as const
};

export default AddProductModal;
