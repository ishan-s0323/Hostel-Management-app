import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submitComplaint = async () => {
    if (!desc.trim()) return;
    try {
      await api.post('/complaints', { description: desc });
      alert('Complaint submitted!');
      setDesc('');
      setShowForm(false);
      load();
    } catch (e) { alert(e.error || 'Failed to submit'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}`, { status });
      load();
    } catch (e) { alert(e.error || 'Failed to update'); }
  };

  if (loading) return <div className="fade-in">Loading complaints…</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <h1 className="page-header" style={{ margin: 0 }}>Complaints</h1>
        {isStudent && (
          <button className="apple-btn" onClick={() => setShowForm(true)}>+ New Complaint</button>
        )}
      </div>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              <th>#</th>
              {!isStudent && <th>Student</th>}
              <th>Description</th>
              <th>Room</th>
              <th>Date</th>
              <th>Status</th>
              {!isStudent && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.complaintId}>
                <td>{c.complaintId}</td>
                {!isStudent && <td>{c.studentName}</td>}
                <td style={{ maxWidth: '240px' }}>{c.description}</td>
                <td>{c.roomId} ({c.blockName})</td>
                <td>{c.reportedDate ? new Date(c.reportedDate).toLocaleDateString('en-IN') : '—'}</td>
                <td><Badge status={c.status} /></td>
                {!isStudent && (
                  <td>
                    <select
                      className="apple-input"
                      style={{ margin: 0, padding: '6px 10px', width: 'auto', fontSize: '12px' }}
                      value={c.status}
                      onChange={e => updateStatus(c.complaintId, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">Processing</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No complaints found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Submit a Complaint" onClose={() => setShowForm(false)}>
          <textarea
            className="apple-input"
            style={{ height: '120px', resize: 'vertical' }}
            placeholder="Describe your complaint in detail…"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <div className="flex gap-12" style={{ marginTop: '8px' }}>
            <button className="apple-btn" onClick={submitComplaint}>Submit</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
