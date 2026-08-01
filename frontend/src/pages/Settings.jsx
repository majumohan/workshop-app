import React, { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, AlertTriangle, CheckCircle, Database, Trash2 } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
  const [file, setFile] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      setMessage('');
      setError('');
      
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/backup`,
        method: 'GET',
        responseType: 'blob', // Important for file download
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Try to extract filename from content-disposition header if available, otherwise fallback
      const contentDisposition = response.headers['content-disposition'];
      let filename = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setMessage('Backup downloaded successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to download backup. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a backup JSON file first.');
      return;
    }

    if (!window.confirm("WARNING: This will OVERWRITE all current data in the database with the contents of the backup file. This action cannot be undone! Are you absolutely sure you want to proceed?")) {
      return;
    }

    try {
      setIsRestoring(true);
      setMessage('');
      setError('');

      const formData = new FormData();
      formData.append('backupFile', file);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/restore`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(response.data.message || 'Data restored successfully! Please refresh the page to see changes.');
      setFile(null);
      document.getElementById('backupFileInput').value = '';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to restore data. Make sure the file is valid.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm("CRITICAL WARNING: You are about to permanently delete all jobs, customers, bikes, repairs, bills, and staff users (except Super Admins). This cannot be undone!")) {
      return;
    }
    
    const confirmation = window.prompt("To proceed, please type 'DELETE' in all caps:");
    if (confirmation !== 'DELETE') {
      setError('Data clearing cancelled. You did not type DELETE correctly.');
      return;
    }

    try {
      setIsRestoring(true); // Re-using loading state
      setMessage('');
      setError('');

      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/clear-data`);
      setMessage(response.data.message || 'Data cleared successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to clear data. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <SettingsIcon size={36} color="var(--accent-primary)" />
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your system preferences and data.</p>
      </div>

      {message && (
        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} />
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Backup Card */}
        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--accent-primary)" />
            Backup Database
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Download a full copy of all jobs, customers, users, bikes, repairs, and billing data as a JSON file. Keep this file safe.
          </p>
          
          <button 
            onClick={handleBackup} 
            disabled={isBackingUp}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.8rem' }}
          >
            <Download size={20} />
            {isBackingUp ? 'Generating Backup...' : 'Download Full Backup'}
          </button>
        </div>

        {/* Restore Card */}
        <div className="card glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            Restore Database
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Restore the system using a previously downloaded JSON backup file. <strong>Warning: This will overwrite all existing data.</strong>
          </p>
          
          <form onSubmit={handleRestore}>
            <div style={{ marginBottom: '1rem' }}>
              <input 
                id="backupFileInput"
                type="file" 
                accept=".json"
                onChange={(e) => setFile(e.target.files[0])}
                className="form-input"
                style={{ cursor: 'pointer' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isRestoring || !file}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', backgroundColor: 'var(--warning)', borderColor: 'var(--warning)', color: 'white' }}
            >
              <Upload size={20} />
              {isRestoring ? 'Restoring Data...' : 'Restore from Backup'}
            </button>
          </form>
        </div>
        
        {/* Clear Data Card */}
        <div className="card glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.5)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <Trash2 size={20} />
            Clear Database
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Permanently wipe all workshop data from the system. <strong>This includes all jobs, customers, bikes, and staff users. Only Super Admin accounts will remain.</strong> Please backup your data first!
          </p>
          
          <button 
            onClick={handleClearData} 
            disabled={isRestoring || isBackingUp}
            className="btn btn-danger"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', marginTop: 'auto' }}
          >
            <Trash2 size={20} />
            Factory Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
