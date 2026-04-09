import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2, ArrowRight, Shield } from 'lucide-react';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/accounts/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                navigate('/');
            } else {
                setError(data.error || 'Invalid username or password');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ 
            width: '100%', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'row',
            backgroundColor: 'var(--bg-dark)',
            overflowX: 'hidden'
        }}>
            <style>{`
                @media (max-width: 1024px) {
                    .auth-container { flex-direction: column !important; }
                    .auth-left { display: none !important; }
                    .auth-right { 
                        width: 100% !important; 
                        padding: 3rem 1.5rem !important; 
                        border-left: none !important;
                    }
                }
            `}</style>
            {/* LEFT PANEL: Branding */}
            <div className="auth-left" style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                padding: '5rem',
                position: 'relative'
            }}>
                <div className="glow-bg" style={{ top: '10%', left: '10%', backgroundColor: 'var(--primary)', opacity: 0.05 }}></div>
                
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ height: '2px', width: '48px', backgroundColor: 'var(--primary)' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2rem', textTransform: 'uppercase', color: 'var(--primary)' }}>
                        Secure Access
                    </span>
                </div>

                <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.04rem', lineHeight: 1.1, color: 'var(--text-main)', marginBottom: '2rem' }}>
                    Welcome<br /><span style={{ color: 'transparent', WebkitTextStroke: '1px var(--primary)' }}>Back</span>
                </h1>

                <p style={{ fontSize: '1.125rem', maxWidth: '400px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '4rem' }}>
                    Continue managing your inventory with the most powerful tools in the network.
                </p>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={20} style={{ color: 'var(--primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>End-to-End Security</span>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Login Form */}
            <div className="auth-right" style={{ 
                width: '560px', 
                backgroundColor: 'var(--bg-card)', 
                borderLeft: '1px solid var(--glass-border)',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                padding: '5rem',
                position: 'relative',
                transition: 'all 0.3s ease'
            }}>
                <div className="glow-bg" style={{ bottom: '10%', right: '10%', backgroundColor: 'var(--accent)', opacity: 0.05 }}></div>

                <div style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '20px', 
                            background: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <LogIn size={32} color="white" />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Login</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to continue</p>
                    </div>

                    {error && (
                        <div style={{ 
                            color: '#ef4444', 
                            backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            fontSize: '0.875rem', 
                            marginBottom: '2rem',
                            border: '1px solid rgba(239, 68, 68, 0.1)'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                name="username"
                                required 
                                className="glass-input"
                                placeholder="Username"
                                value={credentials.username}
                                onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem' }}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="password" 
                                name="password"
                                required 
                                className="glass-input"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem' }}
                            />
                        </div>
                        
                        <button 
                            disabled={loading}
                            className="btn-primary"
                            style={{ padding: '1.1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Register now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
