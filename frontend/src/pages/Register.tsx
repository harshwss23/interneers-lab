import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8000/api/accounts/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role }),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                navigate('/');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: '#f8fafc' 
        }}>
            <div style={{ 
                width: '100%', 
                maxWidth: '450px', 
                padding: '2.5rem', 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
            }}>
                <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '2rem' }}>Create Account</h2>
                {error && <p style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</p>}
                
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Username</label>
                        <input 
                            type="text" 
                            required 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Identify As</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="USER">User</option>
                            <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>
                    <button 
                        disabled={loading}
                        style={{ 
                            backgroundColor: '#4f46e5', 
                            color: 'white', 
                            padding: '0.75rem', 
                            borderRadius: '8px', 
                            fontWeight: 600, 
                            border: 'none', 
                            cursor: 'pointer',
                            marginTop: '1rem'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                    Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
