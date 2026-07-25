import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('workshopUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
          if (user.status === 'pending') {
            setError('Your account is pending owner approval. Please wait to be admitted.');
            setIsLoading(false);
            return;
          }

          localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email, role: user.role }));
          // Redirect to appropriate dashboard based on role
          if (user.role === 'Admin') {
            navigate('/repairs'); // Admins go to repairs by default
          } else {
            navigate('/'); // Owners go to main dashboard
          }
        } else {
          setError('Invalid email or password. Please try again.');
        }
      } catch (err) {
        setError('System error. Please try again.');
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
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Sign in to GearShift Workshop</p>
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
                placeholder="admin@gearshift.com" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
