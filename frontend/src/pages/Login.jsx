import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck, Briefcase } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password, role });
        const user = res.data;

        localStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));
        // Redirect to appropriate dashboard based on role
        if (user.role === 'User') {
          navigate('/repairs'); 
        } else {
          navigate('/'); // Admins and Super Admins go to main dashboard
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
        } else {
            setError('System error. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 800); // Simulate network request
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)', padding: '1rem' }}>
      
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: 0.3, zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'var(--success)', filter: 'blur(120px)', opacity: 0.2, zIndex: 0 }}></div>

      <div className="card glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2rem', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1rem' }}>
            <ShieldCheck size={32} color="var(--accent-primary)" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Sign in to GADGETS PITSTOP</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="admin@gadgetspitstop.com" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Login As</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <select 
                className="form-input" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)', appearance: 'none' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Admin" style={{ background: 'var(--bg-secondary)' }}>Admin</option>
                <option value="User" style={{ background: 'var(--bg-secondary)' }}>User</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', justifyContent: 'center' }} disabled={isLoading}>
            {isLoading ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '500' }}>
              Don't have an account? Register here
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>
            <Link to="/superadmin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Developer Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
