import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, Database, Layout } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'USER' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/accounts/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                navigate('/verify-otp', { state: { email: formData.email } });
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'row',
            backgroundColor: 'var(--bg-dark)',
            overflow: 'hidden'
        }}>
            {/* LEFT PANEL: Branding */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                padding: '5rem',
                position: 'relative'
            }}>
                <div className="glow-bg" style={{ bottom: '10%', left: '10%', backgroundColor: 'var(--accent)', opacity: 0.05 }}></div>
                
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ height: '2px', width: '48px', backgroundColor: 'var(--primary)' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2rem', textTransform: 'uppercase', color: 'var(--primary)' }}>
                        Join the Network
                    </span>
                </div>

                <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.04rem', lineHeight: 1.1, color: 'var(--text-main)', marginBottom: '2rem' }}>
                    Create Your<br /><span style={{ color: 'transparent', WebkitTextStroke: '1px var(--primary)' }}>Account</span>
                </h1>

                <p style={{ fontSize: '1.125rem', maxWidth: '400px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '4rem' }}>
                    Join 1,200+ professionals managing their inventory with precision and security.
                </p>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Database size={20} style={{ color: 'var(--primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Real-time Data Sync</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layout size={20} style={{ color: 'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Intuitive Dashboard</span>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: form */}
            <div style={{ 
                width: '560px', 
                backgroundColor: 'var(--bg-card)', 
                borderLeft: '1px solid var(--glass-border)',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                padding: '5rem',
                position: 'relative'
            }}>
                <div className="glow-bg" style={{ top: '10%', right: '10%', backgroundColor: 'var(--primary)', opacity: 0.05 }}></div>

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
                            <UserPlus size={32} color="white" />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Register</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Get started with your account</p>
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

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                name="username"
                                required 
                                className="glass-input"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem' }}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="email" 
                                name="email"
                                required 
                                className="glass-input"
                                placeholder="Email Address"
                                value={formData.email}
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
                                value={formData.password}
                                onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem' }}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Layout size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <select 
                                name="role"
                                className="glass-input"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem', appearance: 'none', backgroundColor: 'transparent' }}
                            >
                                <option value="USER" style={{ color: "black" }}>Register as Customer (User)</option>
                                <option value="WAREHOUSE_MANAGER" style={{ color: "black" }}>Register as Warehouse Manager</option>
                            </select>
                        </div>
                        
                        <button 
                            disabled={loading}
                            className="btn-primary"
                            style={{ padding: '1.1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Login instead</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
