import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin'
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('workshopUsers') || '[]');
        
        if (users.find(u => u.email === formData.email)) {
          setError('Email is already registered.');
          setIsLoading(false);
          return;
        }

        const newUser = { 
          ...formData, 
          id: Date.now().toString(),
          status: formData.role === 'Owner' ? 'active' : 'pending' 
        };
        users.push(newUser);
        localStorage.setItem('workshopUsers', JSON.stringify(users));
        
        if (newUser.role === 'Admin') {
          setSuccessMsg('Account created successfully. Please wait for an Owner to approve your registration.');
          // Reset form data so they can't just spam it
          setFormData({ name: '', email: '', password: '', role: 'Admin' });
        } else {
          // Auto-login for Owner
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
      
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: 0.3, zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'var(--info)', filter: 'blur(120px)', opacity: 0.2, zIndex: 0 }}></div>

      <div className="card glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2rem', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1rem' }}>
            <UserPlus size={32} color="var(--accent-primary)" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Register a new workshop account</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="John Doe" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)' }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="john@gearshift.com" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)' }}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Account Role</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <select 
                className="form-input" 
                style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)', appearance: 'none' }}
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Admin" style={{ background: 'var(--bg-secondary)' }}>Staff / Admin (Repairs & Intake)</option>
                <option value="Owner" style={{ background: 'var(--bg-secondary)' }}>Owner (Full Access)</option>
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', justifyContent: 'center' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : <><UserPlus size={18} /> Register</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
