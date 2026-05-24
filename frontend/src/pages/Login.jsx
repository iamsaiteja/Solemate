import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        localStorage.setItem("username", "GoogleUser");

        // URL nunchi tokens tholaginchadaniki
        window.history.replaceState({}, document.title, "/");
        
        // Direct ga home page leda products page ki velladaniki
        navigate("/"); 
    }
}, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login/', form);

      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);

      navigate('/');

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#0a0a0a'
    }}>
      <div style={{
        background: '#111',
        padding: '40px',
        borderRadius: '12px',
        width: '350px',
        boxShadow: '0 0 20px rgba(255,255,255,0.05)'
      }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>Login</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: '#e8ff3b',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {/* 🔥 GOOGLE LOGIN */}
        <a
          href="https://solemate.servecounterstrike.com/accounts/google/login/"
          style={{
            display: 'block',
            marginTop: '15px',
            padding: '10px',
            background: '#4285f4',
            color: 'white',
            textAlign: 'center',
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          Login with Google
        </a>

        <p style={{ marginTop: '15px', color: '#aaa' }}>
          New user? <Link to="/register" style={{ color: '#e8ff3b' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;