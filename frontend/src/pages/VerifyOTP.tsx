import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Loader2, RefreshCw, ArrowRight, Shield } from 'lucide-react';

export default function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/accounts/verify-otp/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                navigate('/login');
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            const res = await fetch('/api/accounts/send-otp/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                alert('OTP resent to your email');
            } else {
                setError('Failed to resend OTP');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return <div style={{ color: 'var(--text-main)', textAlign: 'center', padding: '5rem' }}>
            <h2>No email provided.</h2>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{ marginTop: '1rem' }}>Go back to Registration</button>
        </div>;
    }

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
                <div className="glow-bg" style={{ top: '10%', left: '10%', backgroundColor: 'var(--primary)', opacity: 0.05 }}></div>
                
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ height: '2px', width: '48px', backgroundColor: 'var(--primary)' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2rem', textTransform: 'uppercase', color: 'var(--primary)' }}>
                        Security Verification
                    </span>
                </div>

                <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.04rem', lineHeight: 1.1, color: 'var(--text-main)', marginBottom: '2rem' }}>
                    Protect Your<br /><span style={{ color: 'transparent', WebkitTextStroke: '1px var(--primary)' }}>Account</span>
                </h1>

                <p style={{ fontSize: '1.125rem', maxWidth: '400px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '4rem' }}>
                    We've sent a 6-digit verification code to your email. Please enter it to activate your account.
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                        <Shield size={20} style={{ color: 'var(--primary)' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Multi-Factor Authentication</span>
                </div>
            </div>

            {/* RIGHT PANEL: Verify Logic */}
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
                            <ShieldCheck size={32} color="white" />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Verify OTP</h2>
                        <p style={{ color: 'var(--text-muted)' }}>We sent a code to <b>{email}</b></p>
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

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                required 
                                maxLength={6}
                                placeholder="000000"
                                className="glass-input"
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    textAlign: 'center', 
                                    fontSize: '2rem', 
                                    letterSpacing: '0.5em',
                                    paddingLeft: '0.5em', // Center the text properly
                                    height: '80px'
                                }}
                            />
                        </div>
                        
                        <button 
                            disabled={loading}
                            className="btn-primary"
                            style={{ padding: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Verify & Continue <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Didn't receive the code?</p>
                        <button 
                            onClick={handleResend}
                            disabled={resending}
                            style={{ 
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                margin: '0 auto',
                                fontSize: '0.9rem'
                            }}
                        >
                            {resending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            Resend Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
