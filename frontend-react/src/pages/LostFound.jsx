import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function LostFound() {
  const [lostItems, setLostItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ itemName: '', description: '' });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const res = await api.get('/lostfound/lost');
      setLostItems(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.itemName.trim()) return;
    try {
      await api.post('/lostfound/lost', form);
      alert('Lost item reported!');
      setShowForm(false);
      setForm({ itemName: '', description: '' });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  const markFound = async (id) => {
    try {
      await api.put(`/lostfound/claim/${id}`, { verificationStatus: 'verified' });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  if (loading) return <div className="fade-in">Loading…</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <h1 className="page-header" style={{ margin: 0 }}>Lost & Found</h1>
        {isStudent && (
          <button className="apple-btn" onClick={() => setShowForm(true)}>+ Report Lost Item</button>
        )}
      </div>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {!isStudent && <th>Student</th>}
              <th>Item Name</th>
              <th>Description</th>
              <th>Date Lost</th>
              <th>Status</th>
              {!isStudent && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {lostItems.map(item => (
              <tr key={item.lostId}>
                {!isStudent && <td>{item.studentName}</td>}
                <td>{item.itemName}</td>
                <td style={{ maxWidth: '200px' }}>{item.description || '—'}</td>
                <td>{item.lostDate ? new Date(item.lostDate).toLocaleDateString('en-IN') : '—'}</td>
                <td><Badge status={item.status || 'pending'} /></td>
                {!isStudent && (
                  <td>
                    {item.status !== 'claimed' && (
                      <button
                        className="apple-btn success"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                        onClick={() => markFound(item.lostId)}
                      >
                        Mark Found
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {lostItems.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No lost items reported.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Report Lost Item" onClose={() => setShowForm(false)}>
          <input className="apple-input" placeholder="Item Name *" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} />
          <textarea className="apple-input" style={{ height: '100px' }} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-12">
            <button className="apple-btn" onClick={submit}>Submit</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
