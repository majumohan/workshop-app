import React, { useState, useEffect } from 'react';
import { Search, User, Phone, MapPin, Calendar, Clock, CheckCircle, Wrench, X, Eye } from 'lucide-react';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`);
        const jobs = res.data;
      
      // Group jobs by customer (using mobileNumber as unique identifier)
      const customerMap = {};
      
      jobs.forEach(job => {
        if (!customerMap[job.mobileNumber]) {
          customerMap[job.mobileNumber] = {
            name: job.customerName,
            mobile: job.mobileNumber,
            address: job.address || 'N/A', // Assuming address might exist or can be added later
            jobs: [],
            totalSpent: 0,
            totalPaid: 0,
            totalPending: 0
          };
        }
        
        customerMap[job.mobileNumber].jobs.push(job);
        
        if (job.status === 'Completed') {
          const cost = Number(job.totalCost) || 0;
          customerMap[job.mobileNumber].totalSpent += cost;
          if (job.paymentStatus === 'Paid') {
            customerMap[job.mobileNumber].totalPaid += cost;
          } else {
            customerMap[job.mobileNumber].totalPending += cost;
          }
        }
      });

      // Convert map to array and sort by latest job
      const customerArray = Object.values(customerMap).map(c => {
        c.jobs.sort((a, b) => Number(b._id) - Number(a._id));
        c.latestVisit = c.jobs[0]?.dateLogged || 'Unknown';
        return c;
      });

      setCustomers(customerArray);
      } catch (error) {
        console.error("Failed to load customers", error);
      }
    };
    loadCustomers();
  }, []);

  const openHistoryModal = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return <span className="badge badge-success"><CheckCircle size={12} style={{marginRight: '4px'}}/> Completed</span>;
      case 'In Progress': return <span className="badge badge-warning"><Wrench size={12} style={{marginRight: '4px'}}/> In Progress</span>;
      case 'Pending': return <span className="badge badge-danger"><Clock size={12} style={{marginRight: '4px'}}/> Pending</span>;
      default: return <span className="badge badge-info">{status}</span>;
    }
  };

  const filteredCustomers = customers.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const hasMatchingJob = c.jobs.some(job => 
      job.registrationNumber && job.registrationNumber.toLowerCase().includes(searchLower)
    );
    return (
      (c.name && c.name.toLowerCase().includes(searchLower)) ||
      (c.mobile && c.mobile.toLowerCase().includes(searchLower)) ||
      hasMatchingJob
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Customers Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your client base and view their repair history.</p>
        </div>
      </div>

      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or vehicle number..." 
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          {filteredCustomers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              {customers.length === 0 ? "No customers found. Register new intakes to build your directory." : "No customers found matching your search."}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Info</th>
                  <th>Contact Details</th>
                  <th>Registered Vehicles</th>
                  <th>Total Visits</th>
                  <th>Last Visit</th>
                  <th style={{ textAlign: 'right' }}>Payments & Dues</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} color="var(--accent-primary)" />
                        {customer.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <Phone size={14} />
                        {customer.mobile}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {Array.from(new Set(customer.jobs.map(j => (j.registrationNumber||'').toUpperCase()).filter(Boolean))).map(reg => (
                          <span key={reg} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                            {reg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{customer.jobs.length} Job{customer.jobs.length !== 1 && 's'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        {customer.latestVisit}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: 'var(--success)' }}>Paid: ₹{customer.totalPaid.toFixed(2)}</div>
                      {customer.totalPending > 0 && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--warning)', marginTop: '0.2rem', fontWeight: '500' }}>Due: ₹{customer.totalPending.toFixed(2)}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" onClick={() => openHistoryModal(customer)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <Eye size={14} /> View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer History Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} color="var(--accent-primary)" />
                {selectedCustomer.name}'s Profile
              </h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Contact Number</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {selectedCustomer.mobile}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Address</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> {selectedCustomer.address}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Total Paid</div>
                  <div style={{ fontWeight: '600', color: 'var(--success)' }}>₹{selectedCustomer.totalPaid.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Pending Dues</div>
                  <div style={{ fontWeight: '600', color: 'var(--warning)' }}>₹{selectedCustomer.totalPending.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-primary)' }}>Repair History</h4>
                {selectedCustomer.jobs.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No repair history found.</p>
                ) : (
                  <div className="table-container" style={{ border: '1px solid var(--border-color)' }}>
                    <table className="table">
                      <thead style={{ background: 'var(--bg-secondary)' }}>
                        <tr>
                          <th>Date</th>
                          <th>Vehicle</th>
                          <th>Status & Payment</th>
                          <th style={{ textAlign: 'right' }}>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.jobs.map(job => (
                          <tr key={job._id}>
                            <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{job.dateLogged}</td>
                            <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                              <div style={{ fontWeight: '500' }}>{job.bikeBrand} {job.bikeModel}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{job.registrationNumber}</div>
                              
                              {/* Work Done Details */}
                              {(job.parts && job.parts.length > 0) || Number(job.laborCost) > 0 ? (
                                <div style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px', borderLeft: '2px solid var(--accent-primary)', marginTop: '0.5rem' }}>
                                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.2rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}><strong>Work Done</strong></div>
                                  {job.parts && job.parts.length > 0 ? (
                                    <ul style={{ margin: '0 0 0.3rem 0', paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                                      {job.parts.map((p, i) => (
                                        <li key={i}>{p.name} <span style={{color: 'var(--text-muted)'}}>(₹{p.cost})</span></li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.3rem' }}>No parts replaced.</div>
                                  )}
                                  {Number(job.laborCost) > 0 && (
                                    <div style={{ color: 'var(--text-secondary)' }}>Labor Applied: <span style={{color: 'var(--text-primary)'}}>₹{job.laborCost}</span></div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No work details recorded yet.</div>
                              )}
                            </td>
                            <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                              <div style={{ marginBottom: '0.5rem' }}>{getStatusBadge(job.status)}</div>
                              {job.status === 'Completed' && (
                                job.paymentStatus === 'Paid' ? (
                                  <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Paid</span>
                                ) : (
                                  <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Unpaid</span>
                                )
                              )}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '500', verticalAlign: 'top', paddingTop: '1rem' }}>₹{job.totalCost || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
