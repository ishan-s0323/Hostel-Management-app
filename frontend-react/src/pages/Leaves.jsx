import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Leaves() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ requestedRoomType: '', reason: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const res = await api.get('/requests/room-change');
      setRequests(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      await api.post('/requests/room-change', form);
      alert('Room change request submitted!');
      setShowForm(false);
      setForm({ requestedRoomType: '', reason: '' });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/requests/room-change/${id}`, { status });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <div>
          <h1 className="page-header" style={{ margin: 0 }}>Room Change Requests</h1>
          <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Submit requests to change your room or block.</p>
        </div>
        {isStudent && <button className="apple-btn" onClick={() => setShowForm(true)}>+ Request Change</button>}
      </div>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {!isStudent && <th>Student</th>}
              <th>Current Room</th>
              <th>Requested Type</th>
              <th>Reason</th>
              <th>Status</th>
              {!isStudent && <th>Update</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.requestId}>
                {!isStudent && <td>{r.studentName}</td>}
                <td>{r.currentRoomId || '—'}</td>
                <td>{r.requestedRoomType || '—'}</td>
                <td style={{ maxWidth: '200px' }}>{r.reason || '—'}</td>
                <td><Badge status={r.status || 'pending'} /></td>
                {!isStudent && (
                  <td>
                    <select
                      className="apple-input"
                      style={{ margin: 0, padding: '6px 10px', width: 'auto', fontSize: '12px' }}
                      value={r.status}
                      onChange={e => updateStatus(r.requestId, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No room change requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Room Change Request" onClose={() => setShowForm(false)}>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Preferred Room Type</label>
          <select className="apple-input" value={form.requestedRoomType} onChange={e => setForm({ ...form, requestedRoomType: e.target.value })}>
            <option value="">No preference</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
          </select>
          <textarea
            className="apple-input"
            style={{ height: '100px' }}
            placeholder="Reason for room change *"
            value={form.reason}
            onChange={e => setForm({ ...form, reason: e.target.value })}
          />
          <div className="flex gap-12" style={{ marginTop: '8px' }}>
            <button className="apple-btn" onClick={submit}>Submit Request</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
