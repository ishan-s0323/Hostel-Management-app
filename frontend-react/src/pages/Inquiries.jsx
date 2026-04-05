import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    studentId: '', description: '', hasCurfew: false, curfewTime: '21:30'
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';
  const isAdmin = ['admin', 'superadmin', 'warden'].includes(user.role);

  const load = async () => {
    try {
      const res = await api.get('/inquiries');
      const items = Array.isArray(res) ? res : (res.inquiries || []);
      setInquiries(items);
      if (isAdmin) {
        const s = await api.get('/students');
        setStudents(Array.isArray(s) ? s : (s.students || []));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const buildDescription = () => {
    let desc = form.description.trim();
    if (form.hasCurfew && form.curfewTime) {
      desc += `\n\n[DISCIPLINARY RESTRICTION] Biometric curfew: ${form.curfewTime}. Student must return to hostel by ${form.curfewTime}.`;
    }
    return desc;
  };

  const submit = async () => {
    if (!form.description.trim()) { alert('Description is required'); return; }
    if (isAdmin && !form.studentId) { alert('Please select a student'); return; }
    try {
      await api.post('/inquiries', {
        studentId: isAdmin ? Number(form.studentId) : undefined,
        description: buildDescription()
      });
      alert(isAdmin ? 'Inquiry filed on student.' : 'Inquiry raised successfully!');
      setShowForm(false);
      setForm({ studentId: '', description: '', hasCurfew: false, curfewTime: '21:00' });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}`, { status });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  const parseCurfew = (desc) => {
    if (!desc) return null;
    const match = (desc + '').match(/curfew[:\s]+(\d{1,2}):(\d{2})/i);
    if (!match) return null;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,'0')} ${suffix}`;
  };

  if (loading) return <div className="fade-in">Loading inquiries…</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <div>
          <h1 className="page-header" style={{ margin: 0 }}>Disciplinary Inquiries</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
            {isStudent
              ? 'Disciplinary actions and restrictions on your account.'
              : 'Manage student disciplinary records. You can add curfew restrictions here.'}
          </p>
        </div>
        <button className="apple-btn danger" onClick={() => setShowForm(true)}>
          {isAdmin ? '+ File Inquiry' : 'Raise Inquiry'}
        </button>
      </div>

      {isStudent && (
        <div className="info-box mb-24">
          <strong>Note:</strong> This section shows disciplinary restrictions on your account — 
          such as reduced biometric curfew timings (e.g. must return by 9:30), room restrictions, or other penalties.
        </div>
      )}

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {isAdmin && <th>Student</th>}
              <th>Description</th>
              <th>Curfew</th>
              <th>Date Filed</th>
              <th>Status</th>
              {isAdmin && <th>Update Status</th>}
            </tr>
          </thead>
          <tbody>
            {inquiries.map((q, i) => {
              const curfew = parseCurfew(q.description);
              const desc = (q.description || '').replace(/\[DISCIPLINARY RESTRICTION\].*$/s, '').trim();
              return (
                <tr key={i}>
                  {isAdmin && (
                    <td style={{ fontWeight: 600 }}>{q.studentName || '—'}</td>
                  )}
                  <td style={{ maxWidth: '280px', fontSize: '13px' }}>{desc || '—'}</td>
                  <td>
                    {curfew ? (
                      <span style={{
                        background: 'rgba(255,59,48,.15)', color: 'var(--danger)',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700
                      }}>
                        🕘 {curfew}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '12px' }}>None</span>
                    )}
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {q.startDate ? new Date(q.startDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td><Badge status={q.status || 'open'} /></td>
                  {isAdmin && (
                    <td>
                      <select
                        className="apple-input"
                        style={{ margin: 0, padding: '6px 10px', width: 'auto', fontSize: '12px' }}
                        value={q.status || 'open'}
                        onChange={e => updateStatus(q.inquiryId, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
            {inquiries.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                {isStudent ? 'No disciplinary records found on your account. ✅' : 'No inquiries found.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={isAdmin ? 'File Disciplinary Inquiry' : 'Raise an Inquiry'} onClose={() => setShowForm(false)}>
          {isAdmin && (
            <>
              <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Select Student *</label>
              <select
                className="apple-input"
                value={form.studentId}
                onChange={e => setForm({ ...form, studentId: e.target.value })}
              >
                <option value="">— Choose Student —</option>
                {students.map(s => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Reason / Description *</label>
          <textarea
            className="apple-input"
            style={{ height: '100px', resize: 'vertical' }}
            placeholder="Describe the disciplinary action or reason…"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          {/* Curfew restriction toggle */}
          <div
            className="glass"
            style={{ padding: '16px', borderRadius: '10px', marginBottom: '14px',
              border: form.hasCurfew ? '1px solid var(--danger)' : '1px solid var(--border)' }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.hasCurfew}
                onChange={e => setForm({ ...form, hasCurfew: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--danger)' }}
              />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>
                ⏱ Apply Biometric Curfew Restriction
              </span>
            </label>
            {form.hasCurfew && (
              <div style={{ marginTop: '12px' }}>
                <label style={{ color: 'var(--muted)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  Student must return to hostel by (24-hr, e.g. 21:30 = 9:30 PM):
                </label>
                <input
                  type="time"
                  className="apple-input"
                  style={{ marginBottom: 0, width: 'auto' }}
                  value={form.curfewTime}
                  onChange={e => setForm({ ...form, curfewTime: e.target.value })}
                />
                <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '6px' }}>
                  Selected: <strong style={{ color: 'var(--text)' }}>
                    {form.curfewTime ? (() => {
                      const [h, m] = form.curfewTime.split(':').map(Number);
                      const suffix = h >= 12 ? 'PM' : 'AM';
                      const h12 = h % 12 || 12;
                      return `${h12}:${String(m).padStart(2,'0')} ${suffix}`;
                    })() : '—'}
                  </strong>
                </p>
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
                  ⚠ Any biometric EXIT scan after this time will incur a ₹50 fine.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-12">
            <button className="apple-btn danger" onClick={submit}>
              {isAdmin ? 'File Inquiry' : 'Submit'}
            </button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
