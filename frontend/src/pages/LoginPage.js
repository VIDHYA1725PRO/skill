import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const quickLogins = [
    { label: 'Admin', email: 'admin@skillbridge.com', pass: 'admin123', color: '#6d28d9', icon: '🛡️' },
    { label: 'Teacher', email: 'sarah@skillbridge.com', pass: 'teacher123', color: '#0891b2', icon: '👩‍🏫' },
    { label: 'Student', email: 'alice@skillbridge.com', pass: 'student123', color: '#059669', icon: '👩‍🎓' },
  ];

  const doLogin = async (e, em, pw) => {
    if (e) e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(em || email, pw || password);
      navigate(`/${user.role}/dashboard`);
    } catch {
      setError('Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
            <h1>SkillBridge</h1>
            <p>Academic Learning Platform</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={doLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <div style={{ margin: '24px 0', textAlign: 'center', position: 'relative' }}>
            <div style={{ height: 1, background: 'var(--border)' }} />
            {/* <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', padding: '0 12px', fontSize: 12, color: 'var(--text2)' }}>Quick Demo Login</span> */}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {quickLogins.map(q => (
              <button key={q.label} onClick={() => doLogin(null, q.email, q.pass)}
                style={{ padding: '12px 8px', borderRadius: 12, border: `2px solid ${q.color}20`, background: `${q.color}10`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', color: q.color, fontWeight: 600, fontSize: 13 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{q.icon}</div>
                {q.label}
              </button>
            ))}
          </div>
{/* 
          <div style={{ marginTop: 24, padding: 16, background: 'var(--bg)', borderRadius: 12, fontSize: 12, color: 'var(--text2)' }}>
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 6 }}>Demo Credentials:</strong>
            <div>Admin: admin@skillbridge.com / admin123</div>
            <div>Teacher: sarah@skillbridge.com / teacher123</div>
            <div>Student: alice@skillbridge.com / student123</div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
