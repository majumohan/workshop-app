import React, { useState, useEffect } from 'react';
import { Users, Wrench, ClipboardCheck, TrendingUp, Bike, Calendar as CalendarIcon, FilterX } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [filterMode, setFilterMode] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('workshopJobs');
      const jobs = stored ? JSON.parse(stored) : [];
      setAllJobs(jobs);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Derived state based on filter
  const filteredJobs = allJobs.filter(job => {
    if (filterMode === 'all') return true;
    
    // Attempt to parse the job date
    // Note: jobs created via new Date().toLocaleDateString() might format as MM/DD/YYYY or DD/MM/YYYY
    // We convert it to a Date object safely.
    const jobDate = new Date(job.dateLogged);
    if (isNaN(jobDate.getTime())) return true; // fallback if date is unparseable
    
    if (filterMode === 'today') {
      return jobDate.toDateString() === now.toDateString();
    }
    if (filterMode === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return jobDate >= weekAgo;
    }
    if (filterMode === 'thisMonth') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return jobDate >= monthAgo;
    }

    if (filterMode === 'date' && filterDate) {
      // filterDate is YYYY-MM-DD
      // To avoid timezone shift issues, split and compare locally
      const [year, month, day] = filterDate.split('-');
      return jobDate.getFullYear() === parseInt(year) && 
             (jobDate.getMonth() + 1) === parseInt(month) && 
             jobDate.getDate() === parseInt(day);
    }
    
    if (filterMode === 'month' && filterMonth) {
      // filterMonth is YYYY-MM
      const [year, month] = filterMonth.split('-');
      return jobDate.getFullYear() === parseInt(year) && 
             (jobDate.getMonth() + 1) === parseInt(month);
    }
    
    return true;
  });

  const uniqueCustomers = new Set(filteredJobs.map(j => j.mobileNumber));
  const active = filteredJobs.filter(j => j.status !== 'Completed');
  const completed = filteredJobs.filter(j => j.status === 'Completed');
  const totalRev = completed.reduce((sum, j) => sum + (Number(j.totalCost) || 0), 0);

  const stats = {
    totalCustomers: uniqueCustomers.size,
    activeRepairs: active.length,
    completedJobs: completed.length,
    revenue: totalRev
  };

  const sorted = [...filteredJobs].sort((a, b) => Number(b._id) - Number(a._id));
  const recentRepairs = sorted.slice(0, 5);
  
  const sortedCompleted = [...completed].sort((a, b) => Number(b._id) - Number(a._id));
  const recentCompleted = sortedCompleted.slice(0, 5);

  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="card glass-panel flex-between animate-fade-in" style={{ padding: '2rem' }}>
      <div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>{title}</p>
        <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</h3>
      </div>
      <div className={`flex-center ${colorClass}`} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }}>
        {icon}
      </div>
    </div>
  );

  if (loading) return <div className="animate-fade-in">Loading dashboard...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome Back, Admin</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening in your workshop.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
            <CalendarIcon size={16} color="var(--accent-primary)" />
            <select 
              className="form-input" 
              value={filterMode} 
              onChange={(e) => {
                const val = e.target.value;
                setFilterMode(val);
                if (val !== 'date') setFilterDate('');
                if (val !== 'month') setFilterMonth('');
              }}
              style={{ padding: '0.4rem 2rem 0.4rem 0.8rem', minHeight: 'auto', fontSize: '0.9rem', width: 'auto', background: 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              <option value="all">All Time View</option>
              <option value="today">Daily (Today)</option>
              <option value="week">Weekly (This Week)</option>
              <option value="thisMonth">Monthly (This Month)</option>
              <option value="date">Specific Date...</option>
              <option value="month">Specific Month...</option>
            </select>
          </div>

          {filterMode === 'date' && (
            <input 
              type="date" 
              className="form-input animate-fade-in" 
              style={{ padding: '0.4rem 0.8rem', minHeight: 'auto', fontSize: '0.9rem', width: 'auto', background: 'rgba(255,255,255,0.02)' }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          )}

          {filterMode === 'month' && (
            <input 
              type="month" 
              className="form-input animate-fade-in" 
              style={{ padding: '0.4rem 0.8rem', minHeight: 'auto', fontSize: '0.9rem', width: 'auto', background: 'rgba(255,255,255,0.02)' }}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={<Users size={28} color="var(--accent-primary)" />} 
        />
        <StatCard 
          title="Active Repairs" 
          value={stats.activeRepairs} 
          icon={<Wrench size={28} color="var(--warning)" />} 
        />
        <StatCard 
          title="Completed Jobs" 
          value={stats.completedJobs} 
          icon={<ClipboardCheck size={28} color="var(--success)" />} 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.revenue.toFixed(2)}`} 
          icon={<TrendingUp size={28} color="var(--accent-primary)" />} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={20} color="var(--accent-primary)" />
            Recent Repairs
          </h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Bike</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRepairs.length > 0 ? recentRepairs.map(repair => (
                  <tr key={repair._id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{repair.bikeBrand} {repair.bikeModel}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{repair.registrationNumber}</div>
                    </td>
                    <td>{repair.customerName}</td>
                    <td>
                      <span className={`badge ${repair.status === 'Completed' ? 'badge-success' : repair.status === 'In Progress' ? 'badge-warning' : 'badge-danger'}`}>
                        {repair.status}
                      </span>
                    </td>
                    <td>{repair.dateLogged}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent repairs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardCheck size={20} color="var(--success)" />
            Recently Completed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentCompleted.length > 0 ? recentCompleted.map(job => (
              <div key={job._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bike size={20} color="var(--success)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.2rem 0' }}>{job.bikeBrand} {job.bikeModel}</h4>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{job.registrationNumber}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{job.customerName}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{job.mobileNumber}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No completed jobs yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
