import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, Receipt, UserPlus, LogOut, Shield, Menu, X, Settings as SettingsIcon } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import Repairs from './pages/Repairs';
import Billing from './pages/Billing';
import Customers from './pages/Customers';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Staff from './pages/Staff';
import DeveloperAuth from './pages/DeveloperAuth';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide sidebar on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/superadmin') return null;

  const userStr = localStorage.getItem('currentUser');
  let user = null;
  try {
    if (userStr) user = JSON.parse(userStr);
  } catch(e) {}

  if (!user) return null;

  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['Super Admin', 'Admin'] },
    { name: 'Staff Management', path: '/staff', icon: <Shield size={20} />, roles: ['Super Admin', 'Admin'] },
    { name: 'New Intake', path: '/register', icon: <UserPlus size={20} />, roles: ['Super Admin', 'Admin'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['Super Admin', 'Admin', 'User'] },
    { name: 'Repairs', path: '/repairs', icon: <Wrench size={20} />, roles: ['Super Admin', 'Admin', 'User'] },
    { name: 'Billing', path: '/billing', icon: <Receipt size={20} />, roles: ['Super Admin', 'Admin'] },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} />, roles: ['Super Admin', 'Admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem' }}>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              GADGETS PITSTOP
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Workshop Management</p>
          </div>
          <button 
            className="close-btn d-md-none" 
            style={{ display: window.innerWidth > 768 ? 'none' : 'block' }}
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.name} 
              to={item.path}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '500',
                transition: 'all var(--transition-fast)',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent'
              }}
            >
              <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{user.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.2rem' }}>{user.role}</div>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1rem',
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--danger)',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'background 0.2s',
            fontWeight: '500',
            textAlign: 'left'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} /> {user.role} Logout
        </button>
      </div>
      </aside>
    </>
  );
};

// Layout wrapper to handle styles cleanly
const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/superadmin';
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  let user = null;
  if (!isAuthPage) {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) user = JSON.parse(userStr);
    } catch(e) {}
  }

  return (
    <div className={isAuthPage ? '' : 'app-layout'}>
      {!isAuthPage && user && (
        <div className="mobile-header">
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>GADGETS PITSTOP</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{user.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{user.role}</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex' }}>
              <Menu size={28} />
            </button>
          </div>
        </div>
      )}
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <main className={isAuthPage ? '' : 'main-content'}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/superadmin" element={<DeveloperAuth />} />

          {/* Protected Super Admin Routes */}
          <Route path="/" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Billing /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Staff /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Settings /></ProtectedRoute>} />

          {/* Protected Shared Routes */}
          <Route path="/register" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Registration /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'User']}><Customers /></ProtectedRoute>} />
          <Route path="/repairs" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'User']}><Repairs /></ProtectedRoute>} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
