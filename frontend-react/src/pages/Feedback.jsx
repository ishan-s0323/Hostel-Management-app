import { useState, useEffect } from 'react';
import api from '../utils/api';
import Modal from '../components/Modal';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'food', rating: 3, comments: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const res = await api.get('/feedback');
      const items = Array.isArray(res) ? res : (res.feedbacks || []);
      setFeedbacks(isStudent ? items.filter(f => f.studentId === user.id) : items);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, [isStudent]);

  const submit = async () => {
    try {
      await api.post('/feedback', form);
      alert('Feedback submitted!');
      setShowForm(false);
      setForm({ category: 'food', rating: 3, comments: '' });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <h1 className="page-header" style={{ margin: 0 }}>Feedback</h1>
        {isStudent && <button className="apple-btn" onClick={() => setShowForm(true)}>+ Submit Feedback</button>}
      </div>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {!isStudent && <th>Student</th>}
              <th>Category</th>
              <th>Rating</th>
              <th>Comments</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((f, i) => (
              <tr key={i}>
                {!isStudent && <td>{f.studentName || '—'}</td>}
                <td style={{ textTransform: 'capitalize' }}>{f.category}</td>
                <td style={{ color: '#f59e0b', letterSpacing: '-1px' }}>{stars(f.rating || 3)}</td>
                <td style={{ maxWidth: '240px' }}>{f.comments || '—'}</td>
                <td>{f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN') : '—'}</td>
              </tr>
            ))}
            {feedbacks.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No feedback submitted yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Submit Feedback" onClose={() => setShowForm(false)}>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Category</label>
          <select className="apple-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="food">Food & Mess</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="security">Security</option>
            <option value="maintenance">Maintenance</option>
            <option value="internet">Internet & Facilities</option>
            <option value="general">General</option>
          </select>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Rating (1–5)</label>
          <select className="apple-input" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][n - 1]}</option>)}
          </select>
          <textarea className="apple-input" style={{ height: '90px' }} placeholder="Comments (optional)" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} />
          <div className="flex gap-12" style={{ marginTop: '8px' }}>
            <button className="apple-btn" onClick={submit}>Submit</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
