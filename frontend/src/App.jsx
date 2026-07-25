import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, Receipt, UserPlus, LogOut, Shield } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import Repairs from './pages/Repairs';
import Billing from './pages/Billing';
import Customers from './pages/Customers';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Staff from './pages/Staff';
import ProtectedRoute from './components/ProtectedRoute';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide sidebar on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') return null;

  const userStr = localStorage.getItem('currentUser');
  let user = null;
  try {
    if (userStr) user = JSON.parse(userStr);
  } catch(e) {}

  if (!user) return null;

  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['Owner'] },
    { name: 'Staff Management', path: '/staff', icon: <Shield size={20} />, roles: ['Owner'] },
    { name: 'New Intake', path: '/register', icon: <UserPlus size={20} />, roles: ['Owner', 'Admin'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['Owner', 'Admin'] },
    { name: 'Repairs', path: '/repairs', icon: <Wrench size={20} />, roles: ['Owner', 'Admin'] },
    { name: 'Billing', path: '/billing', icon: <Receipt size={20} />, roles: ['Owner'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <aside style={{
      width: '250px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          GearShift
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Workshop Management</p>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.name} 
              to={item.path}
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
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

// Layout wrapper to handle styles cleanly
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  return (
    <div className={isAuthPage ? '' : 'app-layout'}>
      <Sidebar />
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

          {/* Protected Owner Routes */}
          <Route path="/" element={<ProtectedRoute allowedRoles={['Owner']}><Dashboard /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute allowedRoles={['Owner']}><Billing /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['Owner']}><Staff /></ProtectedRoute>} />

          {/* Protected Shared Routes (Owner + Admin) */}
          <Route path="/register" element={<ProtectedRoute allowedRoles={['Owner', 'Admin']}><Registration /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute allowedRoles={['Owner', 'Admin']}><Customers /></ProtectedRoute>} />
          <Route path="/repairs" element={<ProtectedRoute allowedRoles={['Owner', 'Admin']}><Repairs /></ProtectedRoute>} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
