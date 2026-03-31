import React, { useState } from 'react';
import { bulkUploadProducts } from '../services/api';
import ErrorAlert from './ErrorAlert';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError("");
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a CSV file");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const data = await bulkUploadProducts(file);
            setResult(data);
            if (data.errors && data.errors.length === 0) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || "Failed to upload file");
        } finally {
            setLoading(false);
        }
    };

    const downloadSampleCSV = () => {
        const headers = "name,description,brand,price,quantity,category_id\n";
        const rows = [
            "Premium Wireless Mouse,Ergonomic 2.4GHz mouse,Logitech,29.99,100,",
            "Mechanical Keyboard,RGB Backlit Blue Switches,Razer,89.50,50,",
            "Office Ergonomic Chair,High-back with lumbar support,Herman Miller,450.00,20,"
        ].join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_products.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

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
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Bulk Upload Products</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                </div>

                {error && <ErrorAlert message={error} onClose={() => setError("")} />}

                {!result ? (
                    <div style={{ padding: '1rem 0' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#f0f9ff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                            <span style={{ fontSize: '1.2rem' }}>💡</span>
                            <p style={{ margin: 0, color: '#0369a1', fontSize: '0.85rem' }}>
                                Want a template? <button onClick={downloadSampleCSV} style={{ background: 'none', border: 'none', color: '#0284c7', textDecoration: 'underline', padding: 0, cursor: 'pointer', fontWeight: 600 }}>Download Sample CSV</button>
                            </p>
                        </div>
                        
                        <div style={{ 
                            border: '2px dashed #e2e8f0', 
                            padding: '2rem', 
                            textAlign: 'center', 
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer',
                            marginBottom: '1.5rem'
                        }} onClick={() => document.getElementById('csv-upload')?.click()}>
                            <input 
                                type="file" 
                                id="csv-upload" 
                                accept=".csv" 
                                onChange={handleFileChange} 
                                style={{ display: 'none' }}
                            />
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                            {file ? (
                                <p style={{ margin: 0, fontWeight: 600, color: '#4f46e5' }}>{file.name}</p>
                            ) : (
                                <p style={{ margin: 0, color: '#94a3b8' }}>Click to select CSV file</p>
                            )}
                        </div>

                        <button 
                            onClick={handleUpload} 
                            disabled={loading || !file}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                opacity: (loading || !file) ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Uploading...' : 'Start Upload'}
                        </button>
                    </div>
                ) : (
                    <div style={{ padding: '1rem 0' }}>
                        <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1rem' }}>
                            <p style={{ margin: 0, color: '#166534', fontWeight: 600 }}>
                                Successfully processed! {result.data?.length || 0} products created.
                            </p>
                        </div>
                        
                        {result.errors && result.errors.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Errors ({result.errors.length}):</h4>
                                <ul style={{ fontSize: '0.85rem', color: '#64748b', paddingLeft: '1.2rem' }}>
                                    {result.errors.slice(0, 5).map((err: string, i: number) => (
                                        <li key={i} style={{ marginBottom: '0.25rem' }}>{err}</li>
                                    ))}
                                    {result.errors.length > 5 && <li>...and {result.errors.length - 5} more</li>}
                                </ul>
                            </div>
                        )}

                        <button 
                            onClick={() => { onClose(); onSuccess(); }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: '#e2e8f0',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginTop: '1rem'
                            }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkUploadModal;
