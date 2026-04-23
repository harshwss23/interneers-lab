import { ArrowRight, Fingerprint, LogIn, Mail, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container" style={{ 
        width: '100%', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'row',
        backgroundColor: 'var(--bg-dark)',
        overflowX: 'hidden',
        position: 'relative'
    }}>
      <style>{`
        @media (max-width: 1024px) {
            .landing-container { flex-direction: column !important; overflow-y: auto !important; height: auto !important; }
            .landing-left { padding: 3rem 1.5rem !important; flex: none !important; }
            .landing-right { 
                width: 100% !important; 
                padding: 4rem 1.5rem !important; 
                border-left: none !important;
                border-top: 1px solid var(--glass-border) !important;
            }
            .hero-title { fontSize: 3.5rem !important; }
            .stats-ticker { 
                flex-direction: column !important; 
                width: 100% !important; 
                gap: 1.5rem !important;
                padding: 1.5rem !important;
            }
            .stats-divider { display: none !important; }
        }
      `}</style>
      
      {/* Background Decor */}
      <div className="glow-bg" style={{ top: '10%', left: '10%', backgroundColor: 'var(--primary)', opacity: 0.05 }}></div>
      <div className="glow-bg" style={{ bottom: '10%', right: '10%', backgroundColor: 'var(--accent)', opacity: 0.05 }}></div>

      {/* LEFT PANEL */}
      <div className="landing-left" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '5rem',
          position: 'relative',
          zIndex: 1
      }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ height: '2px', width: '48px', backgroundColor: 'var(--primary)' }}></div>
          <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              letterSpacing: '0.2rem', 
              textTransform: 'uppercase', 
              color: 'var(--primary)' 
          }}>
            Exclusive Inventory Network
          </span>
        </div>

        <h1 className="hero-title" style={{ 
            fontSize: '6rem', 
            fontWeight: 950, 
            letterSpacing: '-0.04rem', 
            lineHeight: 1.1, 
            color: 'var(--text-main)',
            marginBottom: '2rem'
        }}>
          Interneers<span style={{ color: 'transparent', WebkitTextStroke: '1px var(--primary)' }}>Lab</span>
        </h1>

        <p style={{ 
            fontSize: '1.25rem', 
            maxWidth: '500px', 
            lineHeight: 1.6, 
            color: 'var(--text-muted)',
            marginBottom: '4rem'
        }}>
            Manage your assets with ease. Secure, fast, and beautifully designed for the modern warehouse.
        </p>

        {/* Stats Ticker */}
        <div className="stats-ticker" style={{ 
            display: 'flex', 
            gap: '3rem', 
            padding: '2rem', 
            backgroundColor: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--premium-shadow)',
            width: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
              <Users style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>1,240+</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Users</div>
            </div>
          </div>
          <div className="stats-divider" style={{ width: '1px', backgroundColor: 'var(--glass-border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                background: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
              <Shield style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>100%</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Secure</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="landing-right" style={{ 
          width: '500px', 
          backgroundColor: 'var(--bg-card)', 
          borderLeft: '1px solid var(--glass-border)',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '4rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '24px', 
              background: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <Fingerprint size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Portal Access</h2>
          <p style={{ color: 'var(--text-muted)' }}>Authenticate to enter the network</p>
        </div>

        <div style={{ width: '100%', display: 'grid', gap: '1rem', maxWidth: '320px' }}>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary"
            style={{ 
                padding: '1.25rem', 
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem' 
            }}
          >
            <LogIn size={20} /> Login with Email <ArrowRight size={20} />
          </button>

          <button 
            onClick={() => navigate('/register')}
            style={{ 
                padding: '1.25rem', 
                borderRadius: '12px', 
                border: '2px solid var(--glass-border)', 
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Mail size={20} /> Register with Email
          </button>
        </div>

        <p style={{ marginTop: '4rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            By entering, you agree to our <br />
            <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Community Guidelines</span>
        </p>
      </div>
    </div>
  );
}
