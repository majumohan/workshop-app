import React, { useState, useEffect } from 'react';
import { Search, Wrench, Calendar, CheckCircle, Clock, X, Trash2, Edit, Save, Plus, Camera, UploadCloud, Eye } from 'lucide-react';
import axios from 'axios';
import { socket } from '../socket';

const Repairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);
  
  // Edit Form State
  const [parts, setParts] = useState([]);
  const [laborCost, setLaborCost] = useState('');
  const [status, setStatus] = useState('Pending');
  const [repairPhotos, setRepairPhotos] = useState({
    frontView: null,
    backView: null,
    leftSide: null,
    rightSide: null,
    odometer: null,
    damagedParts: null
  });
  const [existingPhotos, setExistingPhotos] = useState({});
  const [editFormData, setEditFormData] = useState({});
  const [selectedComplaints, setSelectedComplaints] = useState([]);

  const commonComplaints = [
    'Engine noise',
    'Brake issue',
    'Oil leakage',
    'Chain problem',
    'Battery issue',
    'General service'
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`);
        setRepairs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      }
    };
    fetchJobs();

    const onJobChange = () => {
      fetchJobs();
    };

    socket.on('jobCreated', onJobChange);
    socket.on('jobUpdated', onJobChange);
    socket.on('jobDeleted', onJobChange);

    return () => {
      socket.off('jobCreated', onJobChange);
      socket.off('jobUpdated', onJobChange);
      socket.off('jobDeleted', onJobChange);
    };
  }, []);

  const openJobModal = (job, mode) => {
    setActiveJob(job);
    setModalMode(mode);
    setEditFormData({
      customerName: job.customerName || '',
      mobileNumber: job.mobileNumber || '',
      registrationNumber: job.registrationNumber || '',
      kilometerReading: job.kilometerReading || '',
      otherComplaint: job.otherComplaint || ''
    });
    setSelectedComplaints(job.complaints || []);
    setParts(job.parts && job.parts.length ? job.parts : [{ name: '', cost: '' }]);
    setLaborCost(job.laborCost || '');
    setStatus(job.status || 'Pending');
    setRepairPhotos({
      frontView: null, backView: null, leftSide: null, rightSide: null, odometer: null, damagedParts: null
    });
    setExistingPhotos(job.photos || {});
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(f => URL.createObjectURL(f));
    setRepairPhotos({ ...repairPhotos, [e.target.name]: urls });
  };

  const handleDeletePhoto = (e, key, index) => {
    e.stopPropagation();
    const updated = { ...existingPhotos };
    updated[key] = [...updated[key]];
    updated[key].splice(index, 1);
    setExistingPhotos(updated);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const toggleComplaint = (complaint) => {
    if (selectedComplaints.includes(complaint)) {
      setSelectedComplaints(selectedComplaints.filter(c => c !== complaint));
    } else {
      setSelectedComplaints([...selectedComplaints, complaint]);
    }
  };

  const handlePartChange = (index, e) => {
    const updatedParts = [...parts];
    updatedParts[index][e.target.name] = e.target.value;
    setParts(updatedParts);
  };

  const addPartField = () => setParts([...parts, { name: '', cost: '' }]);
  
  const removePartField = (index) => {
    const updatedParts = parts.filter((_, i) => i !== index);
    setParts(updatedParts);
  };

  const handleSaveJob = (e) => {
    e.preventDefault();
    
    // Calculate total parts cost
    const validParts = parts.filter(p => p.name && p.cost);
    const partsCost = validParts.reduce((sum, p) => sum + Number(p.cost), 0);
    const totalLabor = Number(laborCost) || 0;
    const totalCost = partsCost + totalLabor;

    const mergedPhotos = { ...existingPhotos };
    for (let key in repairPhotos) {
      if (repairPhotos[key] && repairPhotos[key].length > 0) {
        if (!mergedPhotos[key]) mergedPhotos[key] = [];
        mergedPhotos[key] = [...mergedPhotos[key], ...repairPhotos[key]];
      }
    }

    let finalInvoiceNumber = activeJob.invoiceNumber;
    
    if (status === 'Completed' && !finalInvoiceNumber) {
      const completedJobs = repairs.filter(r => r.status === 'Completed' && r.invoiceNumber?.startsWith('GPS/'));
      
      const now = new Date();
      let startYear = now.getFullYear();
      if (now.getMonth() < 3) {
        startYear -= 1;
      }
      const fyStr = `${startYear.toString().slice(-2)}-${(startYear + 1).toString().slice(-2)}`;
      
      const fyJobs = completedJobs.filter(r => r.invoiceNumber.endsWith(fyStr));
      
      let maxSeq = 0;
      fyJobs.forEach(j => {
        const parts = j.invoiceNumber.split('/');
        if (parts.length === 3) {
          const seqStr = parts[1].replace(/\\D/g, '');
          const seq = parseInt(seqStr, 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      });
      
      const nextSeq = maxSeq + 1;
      const paddedSeq = nextSeq.toString().padStart(2, '0');
      finalInvoiceNumber = `GPS/A${paddedSeq}/${fyStr}`;
    }

    const updatedJob = {
      ...activeJob,
      ...editFormData,
      complaints: selectedComplaints,
      photos: mergedPhotos,
      parts: validParts,
      laborCost: totalLabor,
      totalCost: totalCost,
      status: status,
      invoiceNumber: finalInvoiceNumber
    };

    const updatedRepairs = repairs.map(r => r._id === activeJob._id ? updatedJob : r);
    setRepairs(updatedRepairs);
    
    axios.put(`${import.meta.env.VITE_API_URL}/jobs/${activeJob._id}`, updatedJob)
      .catch(err => console.error('Failed to update job on server:', err));
    
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return <span className="badge badge-success"><CheckCircle size={12} style={{marginRight: '4px'}}/> Completed</span>;
      case 'In Progress': return <span className="badge badge-warning"><Wrench size={12} style={{marginRight: '4px'}}/> In Progress</span>;
      case 'Pending': return <span className="badge badge-danger"><Clock size={12} style={{marginRight: '4px'}}/> Pending</span>;
      default: return <span className="badge badge-info">{status}</span>;
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (repair.registrationNumber && repair.registrationNumber.toLowerCase().includes(searchLower)) ||
      (repair.customerName && repair.customerName.toLowerCase().includes(searchLower)) ||
      (repair.bikeBrand && repair.bikeBrand.toLowerCase().includes(searchLower)) ||
      (repair.bikeModel && repair.bikeModel.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Active Repairs</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage ongoing jobs, add parts, and update statuses.</p>
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
              placeholder="Search by vehicle number, customer, or bike..." 
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          {filteredRepairs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              {repairs.length === 0 ? "No active repair jobs. Register a new intake to see it here." : "No jobs found matching your search."}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Job Details</th>
                  <th>Vehicle Number</th>
                  <th>Status</th>
                  <th>Date Logged</th>
                  <th style={{ textAlign: 'right' }}>Cost</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepairs.map(repair => (
                  <tr key={repair._id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{repair.bikeBrand} {repair.bikeModel} <span style={{color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'normal'}}>({repair.customerName})</span></div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {repair.complaints?.length ? repair.complaints.join(', ') : repair.otherComplaint || 'General Service'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {repair.registrationNumber}
                      </span>
                    </td>
                    <td>{getStatusBadge(repair.status)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        {repair.dateLogged}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{repair.totalCost || '0.00'}</td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => openJobModal(repair, 'view')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <Eye size={14} /> View
                      </button>
                      <button className="btn btn-primary" onClick={() => openJobModal(repair, 'edit')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        <Edit size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Job Modal */}
      {isModalOpen && activeJob && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Job Card: {activeJob.bikeBrand} {activeJob.bikeModel}
              </h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveJob} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Editable Intake Data */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Customer Name</label>
                    <input type="text" className="form-input" name="customerName" value={editFormData.customerName} onChange={handleEditFormChange} disabled={modalMode === 'view'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Contact</label>
                    <input type="tel" className="form-input" name="mobileNumber" value={editFormData.mobileNumber} onChange={handleEditFormChange} disabled={modalMode === 'view'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">License Plate</label>
                    <input type="text" className="form-input" name="registrationNumber" value={editFormData.registrationNumber} onChange={handleEditFormChange} style={{ textTransform: 'uppercase' }} disabled={modalMode === 'view'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Odometer (km)</label>
                    <input type="number" className="form-input" name="kilometerReading" value={editFormData.kilometerReading} onChange={handleEditFormChange} disabled={modalMode === 'view'} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                    <label className="form-label" style={{ marginBottom: '0.8rem' }}>Reported Complaints</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
                      {(modalMode === 'view' ? selectedComplaints : commonComplaints).map(complaint => (
                        <div 
                          key={complaint} 
                          onClick={() => modalMode === 'edit' && toggleComplaint(complaint)}
                          style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '8px',
                            border: selectedComplaints.includes(complaint) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            backgroundColor: selectedComplaints.includes(complaint) ? 'var(--accent-light)' : 'rgba(255,255,255,0.02)',
                            color: selectedComplaints.includes(complaint) ? 'var(--accent-primary)' : 'var(--text-primary)',
                            cursor: modalMode === 'edit' ? 'pointer' : 'default',
                            transition: 'all var(--transition-fast)',
                            fontWeight: '500',
                            fontSize: '0.85rem'
                          }}
                        >
                          {complaint}
                        </div>
                      ))}
                      {modalMode === 'view' && selectedComplaints.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No specific complaints selected.</div>
                      )}
                    </div>
                    <textarea className="form-input" name="otherComplaint" value={editFormData.otherComplaint} onChange={handleEditFormChange} rows="2" placeholder="Other notes or detailed complaints..." disabled={modalMode === 'view'}></textarea>
                  </div>
                  
                  {/* Attached Photos Display */}
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0, marginTop: '1rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Camera size={16}/> Attached Photos</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {Object.entries(existingPhotos).map(([key, urls]) => {
                        if (!urls || urls.length === 0) return null;
                        const labelMap = {
                          frontView: 'Front View', backView: 'Back View', leftSide: 'Left Side', 
                          rightSide: 'Right Side', odometer: 'Odometer', damagedParts: 'Damaged Parts'
                        };
                        return urls.map((url, i) => (
                          <div 
                            key={`${key}-${i}`} 
                            style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'zoom-in' }}
                            onClick={() => setEnlargedPhoto(url)}
                          >
                            <img src={url} alt={labelMap[key]} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                            
                            {modalMode === 'edit' && (
                              <button 
                                onClick={(e) => handleDeletePhoto(e, key, i)}
                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                                title="Delete Photo"
                              >
                                <X size={14} color="#fff" />
                              </button>
                            )}

                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem', textAlign: 'center', pointerEvents: 'none' }}>
                              {labelMap[key]}
                            </div>
                          </div>
                        ));
                      })}
                      {(Object.values(existingPhotos).flat().filter(Boolean).length === 0) && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No photos attached.</div>
                      )}
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Parts & Labor Section */}
                <div>
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--accent-primary)' }}>Parts & Labor</h4>
                    {modalMode === 'edit' && (
                      <button type="button" className="btn btn-secondary" onClick={addPartField} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>
                        <Plus size={14} /> Add Part
                      </button>
                    )}
                  </div>
                  
                  {parts.map((part, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        name="name" 
                        value={part.name} 
                        onChange={(e) => handlePartChange(index, e)} 
                        placeholder="Part name" 
                        style={{ flex: 2 }}
                        disabled={modalMode === 'view'}
                      />
                      <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                        <input 
                          type="number" 
                          className="form-input" 
                          name="cost" 
                          value={part.cost} 
                          onChange={(e) => handlePartChange(index, e)} 
                          placeholder="0.00" 
                          style={{ paddingLeft: '1.5rem', width: '100%' }}
                          disabled={modalMode === 'view'}
                        />
                      </div>
                      {modalMode === 'edit' && (
                        <button type="button" className="btn btn-danger" onClick={() => removePartField(index)} style={{ padding: '0.5rem' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Labor Cost (₹)</label>
                    <input type="number" className="form-input" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} placeholder="0.00" disabled={modalMode === 'view'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Status</label>
                    <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ appearance: 'auto' }} disabled={modalMode === 'view'}>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {modalMode === 'edit' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={16} /> Add Missing Photos
                  </label>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>Upload missing intake photos or current condition photos.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: 'Front View', name: 'frontView', multiple: false },
                      { label: 'Back View', name: 'backView', multiple: false },
                      { label: 'Left Side', name: 'leftSide', multiple: false },
                      { label: 'Right Side', name: 'rightSide', multiple: false },
                      { label: 'Odometer', name: 'odometer', multiple: false },
                      { label: 'Damaged Parts', name: 'damagedParts', multiple: true },
                    ].map((field) => (
                      <div key={field.name} style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '0.8rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.5rem' }}>{field.label}</div>
                        <div style={{ fontSize: '0.75rem', color: repairPhotos[field.name]?.length ? 'var(--success)' : 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {repairPhotos[field.name]?.length ? `${repairPhotos[field.name].length} selected` : 'No file'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem', flexDirection: 'column' }}>
                          <label className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', margin: 0 }}>
                            <Camera size={12} /> Take Photo
                            <input type="file" accept="image/*" capture="environment" name={field.name} onChange={handlePhotoChange} multiple={field.multiple} style={{ display: 'none' }} />
                          </label>
                          <label className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', margin: 0 }}>
                            <UploadCloud size={12} /> Browse
                            <input type="file" accept="image/*" name={field.name} onChange={handlePhotoChange} multiple={field.multiple} style={{ display: 'none' }} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
                {modalMode === 'edit' && (
                  <button type="submit" className="btn btn-primary"><Save size={18} /> Save Job Card</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enlarged Photo Lightbox */}
      {enlargedPhoto && (
        <div className="modal-overlay" style={{ zIndex: 9999, padding: '2rem', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={() => setEnlargedPhoto(null)}>
          <button 
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', zIndex: 10000, display: 'flex' }} 
            onClick={() => setEnlargedPhoto(null)}
          >
            <X size={24} color="var(--text-primary)" />
          </button>
          <img 
            src={enlargedPhoto} 
            alt="Enlarged view" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
            onClick={e => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default Repairs;
