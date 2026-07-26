import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const Staff = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${userId}/approve`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to approve user', err);
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}/reject`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to reject user', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={36} />
            Staff Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Approve and manage Staff and User registrations</p>
        </div>
      </div>

      <div className="card glass-panel">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No registrations pending or active found.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem' }}>{user.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email} <span style={{fontSize: '0.8rem', color: 'var(--accent-primary)', marginLeft: '0.5rem'}}>[{user.role}]</span></td>
                    <td style={{ padding: '1rem' }}>
                      {user.status === 'pending' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', fontSize: '0.85rem' }}>
                          <Clock size={14} /> Pending
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.85rem' }}>
                          <CheckCircle size={14} /> Active
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {user.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleApprove(user._id)}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(user._id)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Staff;
