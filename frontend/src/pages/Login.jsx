import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../utils/api';
import "../styles/cinematic.css";

function Login() {

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ================= GOOGLE LOGIN TOKEN HANDLER =================
  useEffect(() => {

    const params = new URLSearchParams(location.search);

    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access && refresh) {

      // save tokens
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      API.get('/auth/profile/')
        .then((res) => {
          localStorage.setItem('username', res.data.username);
          localStorage.setItem('email', res.data.email || '');
        })
        .catch((err) => console.error(err))
        .finally(() => navigate('/products'));

      // redirect after login
      navigate('/products');
    }

  }, [location, navigate]);

  // ================= NORMAL LOGIN =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError('');

    try {

      const res = await API.post('/auth/login/', form);

      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      if (res.data.user) {
        localStorage.setItem('username', res.data.user.username);
        localStorage.setItem('email', res.data.user.email || '');
      }

      navigate('/products');

    } catch (err) {

      setError(
        err.response?.data?.error || 'Login failed'
      );

    } finally {

      setLoading(false);

    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = () => {

    const clientId = "746873785598-pihaf619h7icclsb01vrvv093ik5momp.apps.googleusercontent.com";
    const redirectUri = "https://solemate.servecounterstrike.com/users/auth/google/callback/";

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "email profile",
      access_type: "online",
      prompt: "select_account",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (

    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >

      {/* LEFT PANEL */}
      <div
        style={{
          flex: '1.2',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '104px 44px 44px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >

        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: '#e8ff3b',
            opacity: '0.06'
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: '#e8ff3b',
            opacity: '0.04'
          }}
        />

        <div>

          <div
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#e8ff3b',
              letterSpacing: '4px'
            }}
          >
            SOLE
            <span style={{ color: '#fff' }}>
              MATE
            </span>
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '11px',
              letterSpacing: '2px',
              marginTop: '4px'
            }}
          >
            PREMIUM SNEAKERS
          </div>

        </div>

        <div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '76px',
              fontWeight: '400',
              letterSpacing: '2px',
              color: '#fff',
              lineHeight: '0.95',
              marginBottom: '16px'
            }}
          >
            STEP
            <br />

            <span style={{ color: '#e8ff3b' }}>
              INTO
            </span>

            <br />

            YOUR
            <br />
            STYLE.
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px'
            }}
          >
            10K+ customers. 500+ drops. Zero fakes.
          </div>

        </div>

        <div style={{ display: 'flex', gap: '12px' }}>

          {[
            ['10K+', 'Customers'],
            ['500+', 'Products'],
            ['24/7', 'Support']
          ].map(([num, label]) => (

            <div
              key={label}
              style={{
                border:
                  '0.5px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '12px 18px',
                textAlign: 'center'
              }}
            >

              <div
                style={{
                  color: '#e8ff3b',
                  fontSize: '18px',
                  fontWeight: '700'
                }}
              >
                {num}
              </div>

              <div
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '11px',
                  marginTop: '2px'
                }}
              >
                {label}
              </div>

            </div>

          ))}

        </div>

      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: '1',
          background: 'linear-gradient(165deg, var(--cin-bg-1) 0%, var(--cin-bg-0) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 40px'
        }}
      >

        <div
          style={{
            width: '40px',
            height: '4px',
            background: '#e8ff3b',
            borderRadius: '2px',
            marginBottom: '24px'
          }}
        />

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '40px',
            letterSpacing: '1px',
            color: 'var(--cin-text)',
            marginBottom: '4px'
          }}
        >
          WELCOME BACK
        </div>

        <div
          style={{
            fontSize: '13px',
            color: 'var(--cin-muted)',
            marginBottom: '32px'
          }}
        >
          Login to continue shopping
        </div>

        {error && (

          <p
            style={{
              color: 'red',
              marginBottom: '12px',
              fontSize: '13px'
            }}
          >
            {error}
          </p>

        )}

        {/* GOOGLE LOGIN BUTTON */}
        <button

          onClick={handleGoogleLogin}

          style={{
            width: '100%',
            padding: '13px',
            background: 'var(--cin-input-bg)',
            border: '1.5px solid var(--cin-border)',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '16px',
            color: 'var(--cin-text)',
            transition: 'border-color 0.2s'
          }}

          onMouseEnter={(e) =>
            e.currentTarget.style.borderColor = 'var(--cin-accent)'
          }

          onMouseLeave={(e) =>
            e.currentTarget.style.borderColor = 'var(--cin-border)'
          }
        >

          <svg width="18" height="18" viewBox="0 0 48 48">

            <path
              fill="#FFC107"
              d="M43.6 20H24v8h11.3C33.7 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.5 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"
            />

            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.5 29.1 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />

            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-1.8 13.5-4.8l-6.2-5.2C29.4 35.6 26.8 36.5 24 36.5c-5.3 0-9.8-3.6-11.4-8.5l-6.6 5.1C9.5 39.5 16.3 44 24 44z"
            />

            <path
              fill="#1976D2"
              d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.5-4.6 5.9l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"
            />

          </svg>

          Continue with Google

        </button>

        {/* DIVIDER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}
        >

          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'var(--cin-border)'
            }}
          />

          <span
            style={{
              fontSize: '12px',
              color: 'var(--cin-faint)'
            }}
          >
            or login with username
          </span>

          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'var(--cin-border)'
            }}
          />

        </div>

        {/* USERNAME */}
        <div style={{ marginBottom: '16px' }}>

          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--cin-accent)',
              letterSpacing: '2px',
              marginBottom: '8px'
            }}
          >
            USERNAME
          </div>

          <input
            type="text"
            placeholder="Enter your username"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value
              })
            }
            required
            className="cin-input"
            style={{ boxSizing: 'border-box' }}
          />

        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: '28px' }}>

          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--cin-accent)',
              letterSpacing: '2px',
              marginBottom: '8px'
            }}
          >
            PASSWORD
          </div>

          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            required
            className="cin-input"
            style={{ boxSizing: 'border-box' }}
          />

        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="cin-btn cin-btn-primary"
          style={{ width: '100%', padding: '15px' }}
        >

          {loading ? 'LOADING...' : 'LOGIN'}

        </button>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: 'var(--cin-muted)'
          }}
        >

          New here?{' '}

          <Link
            to="/register"
            style={{
              color: 'var(--cin-accent)',
              fontWeight: '700',
              textDecoration: 'underline'
            }}
          >
            Create account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;