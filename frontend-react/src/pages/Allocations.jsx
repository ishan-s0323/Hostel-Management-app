import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Allocations() {
  const [allocs, setAllocs] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', roomId: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [a, s, r] = await Promise.all([
        api.get('/allocations'),
        api.get('/students'),
        api.get('/rooms?status=available')
      ]);
      setAllocs(Array.isArray(a) ? a : (a.allocations || []));
      setStudents(Array.isArray(s) ? s : (s.students || []));
      setRooms(Array.isArray(r) ? r : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const allocate = async () => {
    try {
      await api.post('/allocations', { studentId: Number(form.studentId), roomId: form.roomId });
      alert('Room allocated!');
      setShowForm(false);
      setForm({ studentId: '', roomId: '' });
      load();
    } catch (e) { alert(e.error || 'Allocation failed'); }
  };

  const release = async (id) => {
    if (!window.confirm('Release this room allocation?')) return;
    try {
      await api.put(`/allocations/${id}/release`);
      load();
    } catch (e) { alert(e.error || 'Failed to release'); }
  };

  if (loading) return <div className="fade-in">Loading allocations…</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <h1 className="page-header" style={{ margin: 0 }}>Room Allocations</h1>
        <button className="apple-btn" onClick={() => setShowForm(true)}>+ Allocate Room</button>
      </div>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              <th>Student</th>
              <th>Department</th>
              <th>Room</th>
              <th>Block</th>
              <th>Type</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allocs.map(a => (
              <tr key={a.allocationId}>
                <td>{a.studentName}</td>
                <td>{a.department || '—'}</td>
                <td>{a.roomId}</td>
                <td>{a.blockName}</td>
                <td>{a.roomType}</td>
                <td><Badge status={a.status} /></td>
                <td>
                  {a.status === 'active' && (
                    <button
                      className="apple-btn danger"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => release(a.allocationId)}
                    >
                      Release
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {allocs.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No allocations found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Allocate Room" onClose={() => setShowForm(false)}>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Select Student</label>
          <select className="apple-input" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
            <option value="">— Choose Student —</option>
            {students.map(s => <option key={s.studentId} value={s.studentId}>{s.name} ({s.email})</option>)}
          </select>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Select Available Room</label>
          <select className="apple-input" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
            <option value="">— Choose Room —</option>
            {rooms.filter(r => r.availabilityStatus === 'available').map(r => (
              <option key={r.roomId} value={r.roomId}>Room {r.roomId} – {r.blockName} – {r.roomType} ({r.currentOccupancy}/{r.capacity})</option>
            ))}
          </select>
          <div className="flex gap-12" style={{ marginTop: '8px' }}>
            <button className="apple-btn" onClick={allocate}>Allocate</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
