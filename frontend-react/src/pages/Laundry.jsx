import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Laundry() {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ itemType: 'shirt', quantity: 1 }]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const res = await api.get('/laundry');
      setOrders(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 2);
      await api.post('/laundry', {
        expectedReturnDate: returnDate.toISOString().split('T')[0],
        items
      });
      alert('Laundry request submitted!');
      setShowForm(false);
      setItems([{ itemType: 'shirt', quantity: 1 }]);
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/laundry/${id}`, { status });
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  const addItem = () => setItems([...items, { itemType: 'shirt', quantity: 1 }]);
  const updateItem = (i, field, val) => {
    const newItems = [...items];
    newItems[i][field] = field === 'quantity' ? Number(val) : val;
    setItems(newItems);
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <h1 className="page-header" style={{ margin: 0 }}>Laundry</h1>
        {isStudent && <button className="apple-btn" onClick={() => setShowForm(true)}>+ Request Laundry</button>}
      </div>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {!isStudent && <th>Student</th>}
              <th>Order ID</th>
              <th>Submitted</th>
              <th>Expected Return</th>
              <th>Status</th>
              {!isStudent && <th>Update</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.orderId}>
                {!isStudent && <td>{o.studentName}</td>}
                <td>#{o.orderId}</td>
                <td>{o.submitDate ? new Date(o.submitDate).toLocaleDateString('en-IN') : '—'}</td>
                <td>{o.expectedReturnDate ? new Date(o.expectedReturnDate).toLocaleDateString('en-IN') : '—'}</td>
                <td><Badge status={o.status || 'pending'} /></td>
                {!isStudent && (
                  <td>
                    <select
                      className="apple-input"
                      style={{ margin: 0, padding: '6px 10px', width: 'auto', fontSize: '12px' }}
                      value={o.status}
                      onChange={e => updateStatus(o.orderId, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="washing">Washing</option>
                      <option value="ready">Ready to Collect</option>
                      <option value="collected">Collected</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No laundry orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Request Laundry Service" onClose={() => setShowForm(false)}>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>Expected return in 2 business days</p>
          {items.map((item, i) => (
            <div key={i} className="flex gap-8 mb-16">
              <select className="apple-input" style={{ marginBottom: 0 }} value={item.itemType} onChange={e => updateItem(i, 'itemType', e.target.value)}>
                <option value="shirt">Shirt</option>
                <option value="trouser">Trouser</option>
                <option value="bedsheet">Bed Sheet</option>
                <option value="towel">Towel</option>
                <option value="jacket">Jacket</option>
                <option value="other">Other</option>
              </select>
              <input
                type="number"
                className="apple-input"
                style={{ marginBottom: 0, width: '80px' }}
                min="1" max="20"
                value={item.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)}
              />
            </div>
          ))}
          <button className="apple-btn ghost full" style={{ marginBottom: '16px' }} onClick={addItem}>+ Add Item</button>
          <div className="flex gap-12">
            <button className="apple-btn" onClick={submit}>Submit Request</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
