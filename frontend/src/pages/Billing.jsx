import React, { useState, useEffect } from 'react';
import { Search, IndianRupee, Download, FileText, Printer, CheckCircle, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalRevenue: 0, pendingPayments: 0, invoicesCount: 0 });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Load data
  const loadData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`);
      const jobs = res.data;
      
      // Bills are just completed jobs
      const completedJobs = jobs.filter(j => j.status === 'Completed');
      
      // Ensure they have a payment status
      completedJobs.forEach(job => {
        if (!job.paymentStatus) job.paymentStatus = 'Unpaid';
      });
      
      // Sort newest first
      completedJobs.sort((a, b) => Number(b._id) - Number(a._id));
      
      setBills(completedJobs);
      
      // Calculate Stats
      let rev = 0;
      let pending = 0;
      completedJobs.forEach(j => {
        if (j.paymentStatus === 'Paid') rev += (Number(j.totalCost) || 0);
        if (j.paymentStatus === 'Unpaid') pending += (Number(j.totalCost) || 0);
      });
      
      setStats({
        totalRevenue: rev,
        pendingPayments: pending,
        invoicesCount: completedJobs.length
      });
    } catch (e) {
      console.error("Failed to load billing data", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (jobId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`, { paymentStatus: 'Paid' });
      loadData(); // refresh UI
    } catch(e) {
      console.error("Failed to record payment", e);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-invoice');
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `${selectedInvoice.invoiceNumber ? String(selectedInvoice.invoiceNumber).replaceAll('/', '-') : 'INV-' + selectedInvoice._id.slice(-6)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const filteredBills = bills.filter(b => {
    const s = searchTerm.toLowerCase();
    return (b.customerName?.toLowerCase().includes(s) || b.registrationNumber?.toLowerCase().includes(s) || b._id.includes(s));
  });

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>Billing & Invoices</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage payments and generate invoices for completed jobs.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--success)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Collected Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{stats.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="card glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--warning)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Payments</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--warning)' }}>₹{stats.pendingPayments.toFixed(2)}</div>
        </div>
        <div className="card glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--accent-primary)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Invoices Generated</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{stats.invoicesCount}</div>
        </div>
      </div>

      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice ID, customer name, or vehicle number..." 
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          {filteredBills.length === 0 ? (
             <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No invoices found. Complete a repair to generate an invoice.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice ID & Date</th>
                  <th>Customer Details</th>
                  <th>Vehicle Details</th>
                  <th>Amount & Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(bill => (
                  <tr key={bill._id}>
                    <td>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                        <FileText size={16} />
                        {bill.invoiceNumber || `INV-${bill._id.slice(-6)}`}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{bill.dateLogged}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{bill.customerName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{bill.mobileNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{bill.bikeBrand} {bill.bikeModel}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{bill.registrationNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>₹{Number(bill.totalCost).toFixed(2)}</div>
                      {bill.paymentStatus === 'Paid' ? (
                        <span className="badge badge-success"><CheckCircle size={10} style={{marginRight: '3px'}}/> Paid</span>
                      ) : (
                        <span className="badge badge-warning">Unpaid</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" onClick={() => setSelectedInvoice(bill)} style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem', fontSize: '0.85rem' }} title="View Invoice">
                        View Invoice
                      </button>
                      {bill.paymentStatus === 'Unpaid' && (
                        <button className="btn btn-primary" onClick={() => handleRecordPayment(bill._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          <IndianRupee size={14} /> Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invoice View Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '700px', width: '90%', padding: '0' }} onClick={e => e.stopPropagation()}>
            
            {/* Action Bar (Not Printed) */}
            <div className="flex-between" style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', borderRadius: '12px 12px 0 0' }}>
              <h3 style={{ margin: 0 }}>Invoice Details</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <Printer size={14} /> Print
                </button>
                <button className="btn btn-primary" onClick={handleDownloadPDF} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <Download size={14} /> PDF
                </button>
                <button className="close-btn" onClick={() => setSelectedInvoice(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Area */}
            <div id="printable-invoice" style={{ padding: 'clamp(1rem, 5vw, 2.5rem)', background: '#fff', color: '#1a1a1a', borderRadius: '0 0 12px 12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>GADGETS PITSTOP</h1>
                  <p style={{ margin: '0', color: '#4b5563', fontSize: '0.9rem' }}>Bharata Mata College, NEAR, Thrikkakara</p>
                  <p style={{ margin: '0', color: '#4b5563', fontSize: '0.9rem' }}>Kakkanad, Kerala 682021</p>
                  <p style={{ margin: '0', color: '#4b5563', fontSize: '0.9rem' }}>Phone: (555) 123-4567</p>
                </div>
                <div style={{ textAlign: 'left', minWidth: '150px' }}>
                  <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', color: '#6366f1', margin: '0 0 0.5rem 0', letterSpacing: '1px', textTransform: 'uppercase' }}>Invoice</h2>
                  <p style={{ margin: '0', color: '#4b5563', fontWeight: '500' }}>#{selectedInvoice.invoiceNumber || `INV-${selectedInvoice._id.slice(-6)}`}</p>
                  <p style={{ margin: '0', color: '#4b5563' }}>Date: {selectedInvoice.dateLogged}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ minWidth: '150px' }}>
                  <h4 style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', margin: '0 0 0.5rem 0' }}>Bill To</h4>
                  <p style={{ margin: '0 0 0.2rem 0', fontWeight: 'bold' }}>{selectedInvoice.customerName}</p>
                  <p style={{ margin: '0 0 0.2rem 0', color: '#4b5563' }}>{selectedInvoice.mobileNumber}</p>
                  <p style={{ margin: '0', color: '#4b5563' }}>{selectedInvoice.address || 'N/A'}</p>
                </div>
                <div style={{ textAlign: 'left', minWidth: '150px' }}>
                  <h4 style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', margin: '0 0 0.5rem 0' }}>Vehicle Details</h4>
                  <p style={{ margin: '0 0 0.2rem 0', fontWeight: 'bold' }}>{selectedInvoice.bikeBrand} {selectedInvoice.bikeModel}</p>
                  <p style={{ margin: '0 0 0.2rem 0', color: '#4b5563', textTransform: 'uppercase' }}>Reg: {selectedInvoice.registrationNumber}</p>
                  <p style={{ margin: '0', color: '#4b5563' }}>Odo: {selectedInvoice.kilometerReading} km</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.8rem', textAlign: 'left', color: '#374151', borderBottom: '1px solid #d1d5db' }}>Description</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right', color: '#374151', borderBottom: '1px solid #d1d5db', width: '100px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.parts && selectedInvoice.parts.map((part, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.8rem', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>Part: {part.name}</td>
                      <td style={{ padding: '0.8rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#4b5563' }}>₹{Number(part.cost).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>Labor Charges</td>
                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#4b5563' }}>₹{Number(selectedInvoice.laborCost || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                    <span>Subtotal</span>
                    <span>₹{Number(selectedInvoice.totalCost).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#4b5563' }}>
                    <span>Tax (0%)</span>
                    <span>₹0.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span>Total</span>
                    <span>₹{Number(selectedInvoice.totalCost).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>Thank you for your business!</p>
                <div style={{ display: 'inline-block', padding: '0.5rem 2rem', border: `2px solid ${selectedInvoice.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b'}`, color: selectedInvoice.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '1rem', transform: 'rotate(-5deg)' }}>
                  {selectedInvoice.paymentStatus}
                </div>
              </div>
              
            </div>
            {/* End Printable */}
          </div>
        </div>
      )}
      
      {/* CSS for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 2rem; }
        }
      `}} />
    </div>
  );
};

export default Billing;
