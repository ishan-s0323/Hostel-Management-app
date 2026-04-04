import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';

export default function Parcels() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = async () => {
    try {
      const res = await api.get('/parcels');
      setParcels(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markCollected = async (id) => {
    try {
      await api.put(`/parcels/${id}`, { status: 'collected' });
      load();
    } catch (e) { alert(e.error || 'Failed to update'); }
  };

  if (loading) return <div className="fade-in">Loading parcels…</div>;

  return (
    <div className="fade-in">
      <h1 className="page-header">Parcels</h1>
      <p className="page-sub">Track your incoming parcels and update collection status.</p>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {user.role !== 'student' && <th>Student</th>}
              <th>Courier</th>
              <th>Reference No.</th>
              <th>Weight</th>
              <th>Pickup Deadline</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map(p => (
              <tr key={p.parcelId}>
                {user.role !== 'student' && <td>{p.studentName}</td>}
                <td>{p.courierCompany || '—'}</td>
                <td>{p.referenceNumber || '—'}</td>
                <td>{p.weightCategory || '—'}</td>
                <td>{p.pickupDeadline ? new Date(p.pickupDeadline).toLocaleDateString('en-IN') : '—'}</td>
                <td><Badge status={p.status || 'pending'} /></td>
                <td>
                  {p.status === 'pending' && (
                    <button
                      className="apple-btn"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => markCollected(p.parcelId)}
                    >
                      Mark Collected
                    </button>
                  )}
                  {p.status === 'collected' && <span style={{ color: 'var(--success)', fontSize: '13px' }}>✓ Collected</span>}
                </td>
              </tr>
            ))}
            {parcels.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No parcels found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
