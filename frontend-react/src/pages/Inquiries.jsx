import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: '', description: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const res = await api.get('/inquiries');
      const items = Array.isArray(res) ? res : (res.inquiries || []);
      setInquiries(items);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      await api.post('/inquiries', form);
      alert('Inquiry submitted!');
      setShowForm(false);
      setForm({ subject: '', description: '' });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  if (loading) return <div className="fade-in">Loading inquiries…</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <div>
          <h1 className="page-header" style={{ margin: 0 }}>Disciplinary Inquiries</h1>
          {isStudent && <p className="text-sm text-muted" style={{ marginTop: '6px' }}>Records of disciplinary actions and restrictions on your account.</p>}
        </div>
        {isStudent && <button className="apple-btn" onClick={() => setShowForm(true)}>Raise Inquiry</button>}
      </div>

      {isStudent && (
        <div className="info-box mb-24">
          <strong>Note:</strong> This section shows any disciplinary restrictions applied to your hostel account — 
          for example, reduced biometric curfew timings, room change restrictions, or other penalties imposed by the warden.
        </div>
      )}

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {!isStudent && <th>Student</th>}
              <th>Subject</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((q, i) => (
              <tr key={i}>
                {!isStudent && <td>{q.studentName || '—'}</td>}
                <td>{q.subject || q.inquiryType || '—'}</td>
                <td style={{ maxWidth: '280px' }}>{q.description || q.details || '—'}</td>
                <td>{q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                <td><Badge status={q.status || 'open'} /></td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                {isStudent ? 'No disciplinary records found on your account.' : 'No inquiries found.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Raise an Inquiry" onClose={() => setShowForm(false)}>
          <input className="apple-input" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          <textarea className="apple-input" style={{ height: '100px' }} placeholder="Details…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-12">
            <button className="apple-btn" onClick={submit}>Submit</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
