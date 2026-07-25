import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

const DeveloperAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('workshopUsers') || '[]');
        const normalizedEmail = formData.email.trim().toLowerCase();

        if (isLogin) {
          // Login Logic
          const user = users.find(u => 
            (u.email.toLowerCase() === normalizedEmail || u.email === formData.email) && 
            u.password === formData.password && 
            u.role === 'Super Admin'
          );

          if (user) {
            localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email, role: user.role }));
            navigate('/');
          } else {
            setError('Invalid credentials or you are not a Super Admin.');
          }
        } else {
          // Registration Logic
          if (users.find(u => u.email.toLowerCase() === normalizedEmail || u.email === formData.email)) {
            setError('Email is already registered.');
            setIsLoading(false);
            return;
          }

          const newUser = { 
            ...formData, 
            role: 'Super Admin',
            email: normalizedEmail,
            id: Date.now().toString(),
            status: 'active' // Super Admins are automatically active
          };
          users.push(newUser);
          localStorage.setItem('workshopUsers', JSON.stringify(users));
          
          // Auto-login
          localStorage.setItem('currentUser', JSON.stringify({ name: newUser.name, email: newUser.email, role: newUser.role }));
          navigate('/');
        }
      } catch (err) {
        setError('System error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)', padding: '1rem' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'var(--danger)', filter: 'blur(120px)', opacity: 0.2, zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'var(--warning)', filter: 'blur(120px)', opacity: 0.2, zIndex: 0 }}></div>

      <div className="card glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2rem', position: 'relative', zIndex: 1, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1rem' }}>
            <ShieldAlert size={32} color="var(--danger)" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Developer Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Super Admin Access Only</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Developer Name" 
                  style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)' }}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="dev@gadgetspitstop.com" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)' }}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Master Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)' }}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', justifyContent: 'center', background: 'var(--danger)', color: 'white' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : isLogin ? <><LogIn size={18} /> Authenticate</> : <><UserPlus size={18} /> Initialize Super Admin</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Need to setup the developer account? " : "Already initialized? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--warning)', textDecoration: 'none', fontWeight: '600', cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? "Initialize here" : "Login here"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperAuth;
