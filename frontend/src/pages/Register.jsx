import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { requestBrandIntro } from '../components/ui/BrandIntro';
import "../styles/cinematic.css";

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/register/', form);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      localStorage.setItem('username', res.data.user.username);
      requestBrandIntro();
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 55% at 75% -5%, var(--cin-glow), transparent 60%), linear-gradient(165deg, var(--cin-bg-0) 0%, var(--cin-bg-1) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(var(--cin-border) 1px, transparent 1px), linear-gradient(90deg, var(--cin-border) 1px, transparent 1px)`,
        backgroundSize: '60px 60px', pointerEvents: 'none', opacity: 0.3,
      }} />

      <div className="fade-up cin-glass" style={{
        width: '100%', maxWidth: '420px',
        padding: '48px 40px', position: 'relative', zIndex: 1,
      }}>
        <Link to="/" style={{
          fontFamily: 'var(--font-display)', fontSize: '22px',
          letterSpacing: '3px', color: 'var(--cin-text)', display: 'block', marginBottom: '32px',
        }}>SoleMate</Link>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '42px',
          letterSpacing: '2px', color: 'var(--cin-text)', marginBottom: '8px',
        }}>Join Us</h1>
        <p style={{ fontSize: '14px', color: 'var(--cin-muted)', marginBottom: '36px' }}>
          Create your account
        </p>

        {error && (
          <div style={{
            background: 'rgba(255,69,69,0.08)', border: '1px solid rgba(255,69,69,0.2)',
            borderRadius: '8px', padding: '12px 16px', marginBottom: '24px',
            fontSize: '13px', color: '#ff4545',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {[
              { key: 'first_name', label: 'First Name', placeholder: 'John' },
              { key: 'last_name', label: 'Last Name', placeholder: 'Doe' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '11px', color: 'rgba(245,245,245,0.35)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  {f.label}
                </label>
                <input type="text" placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ padding: '10px 12px', fontSize: '13px' }}
                />
              </div>
            ))}
          </div>

          {[
            { key: 'username', label: 'Username *', type: 'text', placeholder: 'john_doe', required: true },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
            { key: 'password', label: 'Password *', type: 'password', placeholder: '••••••••', required: true },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(245,245,245,0.35)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                {f.label}
              </label>
              <input type={f.type} placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required={f.required}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} className="cin-btn cin-btn-primary" style={{
            width: '100%', padding: '15px', marginTop: '12px',
            cursor: loading ? 'wait' : 'pointer',
            marginBottom: '24px', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(245,245,245,0.3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#fa5400', fontWeight: '500' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;