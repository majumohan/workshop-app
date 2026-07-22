import React, { useState } from 'react';
import { Search, Plus, Bike as BikeIcon, FileText } from 'lucide-react';

const Bikes = () => {
  const [bikes, setBikes] = useState([
    { id: 1, make: 'Honda', model: 'CB350', year: 2022, plate: 'MH12AB1234', owner: 'John Doe' },
    { id: 2, make: 'Yamaha', model: 'R15', year: 2021, plate: 'KA01XY9876', owner: 'Jane Smith' },
  ]);

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Bikes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage bikes and service histories.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Register Bike
        </button>
      </div>

      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by make, model, or plate..." 
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Bike Details</th>
                <th>License Plate</th>
                <th>Owner</th>
                <th style={{ textAlign: 'right' }}>History</th>
              </tr>
            </thead>
            <tbody>
              {bikes.map(bike => (
                <tr key={bike.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BikeIcon size={20} color="var(--accent-primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{bike.make} {bike.model}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Year: {bike.year}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '1px' }}>
                      {bike.plate}
                    </span>
                  </td>
                  <td>{bike.owner}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary">
                      <FileText size={16} />
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bikes;
