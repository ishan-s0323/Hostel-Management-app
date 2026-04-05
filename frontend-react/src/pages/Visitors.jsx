import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ visitorName: '', relation: '', phone: '', idProof: '', studentId: '' });
  const [students, setStudents] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const res = await api.get('/visitors');
      setVisitors(Array.isArray(res) ? res : []);
      if (!isStudent) {
        const sRes = await api.get('/students');
        setStudents(Array.isArray(sRes) ? sRes : (sRes.students || []));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const logIn = async () => {
    if (!form.visitorName.trim()) return;
    try {
      const payload = {
        visitorName: form.visitorName,
        relation: form.relation,
        phone: form.phone,
        idProof: form.idProof,
        studentId: isStudent ? user.id : Number(form.studentId)
      };
      await api.post('/visitors', payload);
      alert('Visitor logged in!');
      setShowForm(false);
      setForm({ visitorName: '', relation: '', phone: '', idProof: '', studentId: '' });
      load();
    } catch (e) { alert(e.error || 'Failed to log visitor'); }
  };

  const logOut = async (id) => {
    try {
      await api.put(`/visitors/${id}/checkout`);
      load();
    } catch (e) { alert(e.error || 'Failed to check out'); }
  };

  if (loading) return <div className="fade-in">Loading visitors…</div>;

  const active = visitors.filter(v => !v.exitTime);
  const past = visitors.filter(v => v.exitTime);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <h1 className="page-header" style={{ margin: 0 }}>Visitor Log</h1>
        <button className="apple-btn" onClick={() => setShowForm(true)}>+ Log Visitor In</button>
      </div>

      {active.length > 0 && (
        <>
          <h3 style={{ marginBottom: '12px', color: 'var(--success)' }}>🟢 Currently Inside ({active.length})</h3>
          <div className="glass table-wrap" style={{ marginBottom: '28px' }}>
            <table className="table-glass">
              <thead>
                <tr>
                  {!isStudent && <th>Host Student</th>}
                  <th>Visitor Name</th>
                  <th>Relation</th>
                  <th>Phone</th>
                  <th>Entry Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {active.map(v => (
                  <tr key={v.visitorId}>
                    {!isStudent && <td>{v.studentName || '—'}</td>}
                    <td>{v.visitorName}</td>
                    <td>{v.relation || '—'}</td>
                    <td>{v.phone || '—'}</td>
                    <td>{v.entryTime ? new Date(v.entryTime).toLocaleString('en-IN') : '—'}</td>
                    <td>
                      <button
                        className="apple-btn danger"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                        onClick={() => logOut(v.visitorId)}
                      >
                        Log Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3 style={{ marginBottom: '12px', color: 'var(--muted)' }}>Past Visits</h3>
      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {!isStudent && <th>Host Student</th>}
              <th>Visitor Name</th>
              <th>Relation</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {past.map(v => {
              const entry = v.entryTime ? new Date(v.entryTime) : null;
              const exit = v.exitTime ? new Date(v.exitTime) : null;
              const mins = entry && exit ? Math.round((exit - entry) / 60000) : null;
              return (
                <tr key={v.visitorId}>
                  {!isStudent && <td>{v.studentName || '—'}</td>}
                  <td>{v.visitorName}</td>
                  <td>{v.relation || '—'}</td>
                  <td>{entry ? entry.toLocaleString('en-IN') : '—'}</td>
                  <td>{exit ? exit.toLocaleString('en-IN') : '—'}</td>
                  <td>{mins !== null ? `${mins} min` : '—'}</td>
                </tr>
              );
            })}
            {past.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No past visits recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Log Visitor In" onClose={() => setShowForm(false)}>
          {!isStudent && (
            <>
              <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Host Student</label>
              <select className="apple-input" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
                <option value="">— Select Student —</option>
                {students.map(s => <option key={s.studentId} value={s.studentId}>{s.name}</option>)}
              </select>
            </>
          )}
          <input className="apple-input" placeholder="Visitor Name *" value={form.visitorName} onChange={e => setForm({ ...form, visitorName: e.target.value })} />
          <input className="apple-input" placeholder="Relation (e.g. Parent, Friend)" value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} />
          <input className="apple-input" placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input className="apple-input" placeholder="ID Proof (Aadhar / Passport No.)" value={form.idProof} onChange={e => setForm({ ...form, idProof: e.target.value })} />
          <div className="flex gap-12" style={{ marginTop: '8px' }}>
            <button className="apple-btn" onClick={logIn}>Log In</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
