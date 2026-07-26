import React, { useState, useEffect } from 'react';
import { UserPlus, Bike, Save, CheckCircle, Camera, UploadCloud, AlertCircle, Clock, Wrench, History } from 'lucide-react';
import axios from 'axios';

const Registration = () => {
  const [allJobs, setAllJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`);
        setAllJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs history', err);
      }
    };
    fetchJobs();
  }, []);

  const [formData, setFormData] = useState({
    // Customer Details
    customerName: '',
    mobileNumber: '',
    alternateNumber: '',
    address: '',
    // Bike Details
    bikeBrand: '',
    bikeModel: '',
    registrationNumber: '',
    kilometerReading: '',
    serviceDate: new Date().toISOString().split('T')[0], // Default to today
    otherComplaint: ''
  });

  const [selectedComplaints, setSelectedComplaints] = useState([]);

  const commonComplaints = [
    'Engine noise',
    'Brake issue',
    'Oil leakage',
    'Chain problem',
    'Battery issue',
    'General service'
  ];

  const toggleComplaint = (complaint) => {
    if (selectedComplaints.includes(complaint)) {
      setSelectedComplaints(selectedComplaints.filter(c => c !== complaint));
    } else {
      setSelectedComplaints([...selectedComplaints, complaint]);
    }
  };

  const [photos, setPhotos] = useState({
    frontView: null,
    backView: null,
    leftSide: null,
    rightSide: null,
    odometer: null,
    damagedParts: null
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [bikeHistory, setBikeHistory] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };

    if (name === 'registrationNumber' && value.trim().length >= 3) {
      const matches = allJobs.filter(j => (j.registrationNumber || '').toUpperCase() === value.trim().toUpperCase());
      
      if (matches.length > 0) {
        matches.sort((a, b) => Number(b._id) - Number(a._id));
        const latestJob = matches[0];
        
        // Auto-fill empty fields from the latest record of this bike
        updatedForm.customerName = formData.customerName || latestJob.customerName;
        updatedForm.mobileNumber = formData.mobileNumber || latestJob.mobileNumber;
        updatedForm.alternateNumber = formData.alternateNumber || latestJob.alternateNumber;
        updatedForm.address = formData.address || latestJob.address;
        updatedForm.bikeBrand = formData.bikeBrand || latestJob.bikeBrand;
        updatedForm.bikeModel = formData.bikeModel || latestJob.bikeModel;
        
        setBikeHistory(matches);
      } else {
        setBikeHistory([]);
      }
    } else if (name === 'registrationNumber' && value.trim().length < 3) {
      setBikeHistory([]);
    }

    setFormData(updatedForm);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPhotos({ ...photos, [e.target.name]: urls });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newJob = {
        ...formData,
        complaints: selectedComplaints,
        photos: photos,
        status: 'Pending',
        dateLogged: new Date().toLocaleDateString(),
        parts: [],
        laborCost: 0,
        totalCost: 0
      };

      console.log('Submitting Registration Data:', newJob);
      
      await axios.post(`${import.meta.env.VITE_API_URL}/jobs`, newJob);
      
      setIsSuccess(true);
      // Refresh local history array
      setAllJobs([newJob, ...allJobs]);

      setTimeout(() => {
        setIsSuccess(false);
        // Reset form
        setFormData({
          customerName: '', mobileNumber: '', alternateNumber: '', address: '',
          bikeBrand: '', bikeModel: '', registrationNumber: '', kilometerReading: '',
          serviceDate: new Date().toISOString().split('T')[0],
          otherComplaint: ''
        });
        setSelectedComplaints([]);
        setPhotos({
          frontView: null, backView: null, leftSide: null, rightSide: null, odometer: null, damagedParts: null
        });
      }, 3000);

    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Vehicle Intake Registration</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Unified form to register a new customer and their bike for service.</p>
      </div>

      {isSuccess && (
        <div className="card glass-panel" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
          <CheckCircle size={20} color="var(--success)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Registration completed successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card glass-panel" style={{ padding: '2rem' }}>
        
        {/* Bike Section */}
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
          <Bike size={20} />
          Bike Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bike Brand</label>
            <input type="text" className="form-input" name="bikeBrand" value={formData.bikeBrand} onChange={handleInputChange} required placeholder="e.g. Honda, Yamaha" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bike Model</label>
            <input type="text" className="form-input" name="bikeModel" value={formData.bikeModel} onChange={handleInputChange} required placeholder="e.g. CBR 600RR" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Registration Number</label>
            <input type="text" className="form-input" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} required placeholder="License Plate" style={{ textTransform: 'uppercase' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Kilometer Reading</label>
            <input type="number" className="form-input" name="kilometerReading" value={formData.kilometerReading} onChange={handleInputChange} required placeholder="Odometer reading" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Service Date</label>
            <input type="date" className="form-input" name="serviceDate" value={formData.serviceDate} onChange={handleInputChange} required />
          </div>
        </div>

        {bikeHistory.length > 0 && (
          <div className="animate-fade-in" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--accent-primary)', marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
              <History size={18} />
              Previous Repair History (Found existing bike record)
            </h3>
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <table className="table" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(255,255,255,0.05)' }}>Date</th>
                    <th style={{ background: 'rgba(255,255,255,0.05)' }}>Complaints</th>
                    <th style={{ background: 'rgba(255,255,255,0.05)' }}>Status</th>
                    <th style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'right' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {bikeHistory.map(job => (
                    <tr key={job._id}>
                      <td>{job.dateLogged}</td>
                      <td>{job.complaints?.join(', ') || job.otherComplaint || 'General Service'}</td>
                      <td>
                        <span className={`badge ${job.status === 'Completed' ? 'badge-success' : job.status === 'In Progress' ? 'badge-warning' : 'badge-danger'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '500' }}>₹{job.totalCost || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

        {/* Customer Section */}
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
          <UserPlus size={20} />
          Customer Details
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Customer Name</label>
            <input type="text" className="form-input" name="customerName" value={formData.customerName} onChange={handleInputChange} required placeholder="Full Name" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mobile Number</label>
            <input type="tel" className="form-input" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required placeholder="+1 234 567 8900" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Alternate Contact Number</label>
            <input type="tel" className="form-input" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} placeholder="Optional" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
            <label className="form-label">Address</label>
            <textarea className="form-input" name="address" value={formData.address} onChange={handleInputChange} rows="2" placeholder="Full residential address"></textarea>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

        {/* Complaints Section */}
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
          <AlertCircle size={20} />
          Complaint Details
        </h3>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select the issues reported by the customer.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {commonComplaints.map(complaint => (
            <div 
              key={complaint} 
              onClick={() => toggleComplaint(complaint)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: selectedComplaints.includes(complaint) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                backgroundColor: selectedComplaints.includes(complaint) ? 'var(--accent-light)' : 'rgba(255,255,255,0.02)',
                color: selectedComplaints.includes(complaint) ? 'var(--accent-primary)' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}
            >
              {complaint}
            </div>
          ))}
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Other Complaints / Detailed Notes</label>
          <textarea 
            className="form-input" 
            name="otherComplaint" 
            value={formData.otherComplaint} 
            onChange={handleInputChange} 
            rows="2" 
            placeholder="Describe any other issues..."
          ></textarea>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

        {/* Bike Photo Capture Section */}
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
          <Camera size={20} />
          Bike Photo Capture
        </h3>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upload photos documenting the condition of the bike at intake.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { label: 'Front View', name: 'frontView', multiple: false },
            { label: 'Back View', name: 'backView', multiple: false },
            { label: 'Left Side', name: 'leftSide', multiple: false },
            { label: 'Right Side', name: 'rightSide', multiple: false },
            { label: 'Odometer', name: 'odometer', multiple: false },
            { label: 'Damaged Parts', name: 'damagedParts', multiple: true },
          ].map((field) => (
            <div key={field.name} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{field.label} {field.multiple && '(Multiple)'}</label>
              <div style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '0.8rem', color: photos[field.name]?.length ? 'var(--success)' : 'var(--text-muted)', marginBottom: '1rem' }}>
                  {photos[field.name]?.length ? `${photos[field.name].length} file(s) selected` : 'No photo selected'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label className="btn btn-secondary" style={{ flex: 1, padding: '0.6rem 0.2rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', margin: 0 }}>
                    <Camera size={14} /> Take Photo
                    <input type="file" accept="image/*" capture="environment" name={field.name} onChange={handlePhotoChange} multiple={field.multiple} style={{ display: 'none' }} />
                  </label>
                  <label className="btn btn-secondary" style={{ flex: 1, padding: '0.6rem 0.2rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', margin: 0 }}>
                    <UploadCloud size={14} /> Upload
                    <input type="file" accept="image/*" name={field.name} onChange={handlePhotoChange} multiple={field.multiple} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            <Save size={18} />
            Complete Registration
          </button>
        </div>

      </form>
    </div>
  );
};

export default Registration;
