import React, { useState, useEffect } from 'react';
import { Search, Plus, ClipboardList, Camera, AlertCircle, X, UploadCloud } from 'lucide-react';
import axios from 'axios';

const Inspections = () => {
  const [inspections, setInspections] = useState([
    { _id: '1', bike: 'Honda CB350', date: 'Oct 24, 2023', inspector: 'Tech Alex', issues: 2, status: 'Needs Attention' },
    { _id: '2', bike: 'Yamaha R15', date: 'Oct 23, 2023', inspector: 'Tech Sam', issues: 0, status: 'Passed' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ bikeId: '', notes: '' });
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    // Fetch inspections when DB is ready
    axios.get(`${import.meta.env.VITE_API_URL}/inspections`)
      .then(res => {
         // Formatting logic would go here
      })
      .catch(err => console.error("API error (using mock data):", err));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhotos(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('bikeId', formData.bikeId || '650abcd123456'); // Mock ID if empty
    data.append('notes', formData.notes);
    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        data.append('photos', photos[i]);
      }
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/inspections`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Assuming res.data comes back populated or we mock it
      const newInsp = { _id: res.data._id, bike: 'Selected Bike', date: 'Just now', inspector: 'Current User', issues: 0, status: 'Passed' };
      setInspections([newInsp, ...inspections]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save to DB, adding to local state instead", err);
      const newInsp = { _id: Date.now().toString(), bike: 'Mock Bike', date: 'Just now', inspector: 'Current User', issues: 0, status: 'Pending' };
      setInspections([newInsp, ...inspections]);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Inspections</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Pre-repair checklists and photo documentation.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          New Inspection
        </button>
      </div>

      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search inspections..." 
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Bike</th>
                <th>Date & Inspector</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Documentation</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map(insp => (
                <tr key={insp._id}>
                  <td>
                    <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ClipboardList size={16} color="var(--accent-primary)" />
                      {insp.bike}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>{insp.date}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By: {insp.inspector}</div>
                  </td>
                  <td>
                    {insp.status === 'Passed' ? (
                      <span className="badge badge-success">Passed</span>
                    ) : (
                      <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}>
                        <AlertCircle size={12} /> {insp.issues} Issues Found
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      <Camera size={14} /> View Photos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Inspection / Photo Upload Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Log Inspection & Upload Photos</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Bike Reference ID</label>
                  <input type="text" className="form-input" name="bikeId" value={formData.bikeId} onChange={handleInputChange} placeholder="Enter Bike ID" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Inspection Notes</label>
                  <textarea className="form-input" name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Enter any visible damage or notes..." style={{ resize: 'vertical' }}></textarea>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Upload Photos</label>
                  <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <UploadCloud size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Drag & drop files or browse</p>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ 
                        background: 'var(--bg-secondary)', 
                        color: 'var(--text-primary)', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        width: '100%',
                        cursor: 'pointer'
                      }} 
                    />
                    {photos && <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--success)' }}>{photos.length} file(s) selected</p>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Inspection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspections;
