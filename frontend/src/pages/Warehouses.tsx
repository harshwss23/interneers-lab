import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWarehouses, Warehouse } from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

export default function Warehouses() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getWarehouses()
            .then(data => {
                setWarehouses(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Unable to load warehouses. You may not have permission.");
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading warehouses...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {error && <ErrorAlert message={error} onClose={() => setError("")} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#0f172a', margin: 0 }}>Warehouses</h1>
                <p style={{ color: '#64748b' }}>{warehouses.length} locations active</p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '1.5rem' 
            }}>
                {warehouses.map(w => (
                    <Link key={w.id} to={`/warehouse/${w.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ 
                            backgroundColor: 'white', 
                            padding: '1.5rem', 
                            borderRadius: '12px', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{w.name}</h3>
                            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.875rem' }}>{w.location}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    padding: '0.25rem 0.5rem', 
                                    backgroundColor: '#f1f5f9', 
                                    color: '#475569', 
                                    borderRadius: '4px' 
                                }}>
                                    Capacity: {w.capacity} units
                                </span>
                                <span style={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600 }}>View Stock →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
