import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [paying, setPaying] = useState(null);
  const [showAdvance, setShowAdvance] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({ feeType: 'hostel_rent', amount: '' });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const load = async () => {
    try {
      const res = await api.get('/fees');
      setFees(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (fee) => {
    try {
      await api.post(`/fees/${fee.feeId}/pay`, {
        amountPaid: fee.amount,
        paymentMethod: 'online',
      });
      alert('Payment successful!');
      setPaying(null);
      load();
    } catch (e) {
      alert(e.error || e.message || JSON.stringify(e) || 'Payment failed');
    }
  };

  const handleAdvancePay = async () => {
    if (!advanceForm.amount || Number(advanceForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      // Step 1: create fee record
      const createRes = await api.post('/fees', {
        amount: Number(advanceForm.amount),
        dueDate: dueDateStr,
        feeType: advanceForm.feeType
      });

      if (!createRes || !createRes.id) {
        throw new Error('Fee creation failed — no ID returned');
      }

      // Step 2: immediately pay it
      await api.post(`/fees/${createRes.id}/pay`, {
        amountPaid: Number(advanceForm.amount),
        paymentMethod: 'online'
      });

      alert(`Advance payment of ₹${Number(advanceForm.amount).toLocaleString('en-IN')} recorded successfully!`);
      setShowAdvance(false);
      setAdvanceForm({ feeType: 'hostel', amount: '' });
      load();
    } catch (e) {
      const msg = e.error || e.message || (typeof e === 'string' ? e : JSON.stringify(e));
      alert('Advance payment failed: ' + msg);
    }
  };

  const pending = fees.filter(f => ['pending', 'overdue'].includes(f.status));
  const paid = fees.filter(f => f.status === 'paid');

  if (loading) return <div className="fade-in">Loading fees…</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <h1 className="page-header" style={{ margin: 0 }}>Fees</h1>
        {isStudent && (
          <button className="apple-btn ghost" onClick={() => setShowAdvance(true)}>
            + Pay in Advance
          </button>
        )}
      </div>

      {isStudent && pending.length > 0 && (
        <>
          <h3 style={{ marginBottom: '16px', color: 'var(--danger)' }}>⚠ Pending / Overdue</h3>
          <div className="card-grid mb-24" style={{ marginBottom: '28px' }}>
            {pending.map(fee => (
              <div key={fee.feeId} className="room-card glass" style={{ borderTop: '3px solid var(--danger)' }}>
                <div className="flex justify-between items-center mb-16">
                  <h3>{fee.feeType || 'Fee'}</h3>
                  <Badge status={fee.status} />
                </div>
                <div className="meta">
                  <div><strong>Amount:</strong> {fmt(fee.amount)}</div>
                  <div><strong>Due:</strong> {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : '—'}</div>
                </div>
                <button className="apple-btn full" onClick={() => setPaying(fee)}>Pay Now</button>
              </div>
            ))}
          </div>
        </>
      )}

      {isStudent && pending.length === 0 && (
        <div className="info-box mb-24" style={{ background: 'rgba(52,199,89,.1)', borderColor: 'rgba(52,199,89,.3)' }}>
          ✅ All fees are paid. You can make an advance payment using the button above.
        </div>
      )}

      <h3 style={{ marginBottom: '16px' }}>
        {isStudent ? 'Full Fee History' : 'All Fee Records'}
      </h3>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {!isStudent && <th>Student</th>}
              <th>Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {fees.map(fee => (
              <tr key={fee.feeId}>
                {!isStudent && <td>{fee.studentName}</td>}
                <td>{fee.feeType || '—'}</td>
                <td>{fmt(fee.amount)}</td>
                <td>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                <td><Badge status={fee.status} /></td>
                <td>
                  {['pending', 'overdue'].includes(fee.status) && (
                    <button className="apple-btn" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setPaying(fee)}>
                      {isStudent ? 'Pay' : 'Mark Paid'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No fee records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {paying && (
        <Modal title="Confirm Payment" onClose={() => setPaying(null)}>
          <div className="info-box mb-24">
            <div><strong>Fee Type:</strong> {paying.feeType}</div>
            <div><strong>Amount:</strong> {fmt(paying.amount)}</div>
          </div>
          <div className="flex gap-12">
            <button className="apple-btn success" onClick={() => handlePay(paying)}>Confirm Payment</button>
            <button className="apple-btn ghost" onClick={() => setPaying(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {showAdvance && (
        <Modal title="Pay in Advance" onClose={() => setShowAdvance(false)}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
            Submit an advance payment. This will be recorded against your account.
          </p>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Fee Category</label>
          <select className="apple-input" value={advanceForm.feeType} onChange={e => setAdvanceForm({ ...advanceForm, feeType: e.target.value })}>
            <option value="hostel_rent">Hostel Rent</option>
            <option value="mess">Mess Fee</option>
            <option value="maintenance">Maintenance</option>
            <option value="security_deposit">Security Deposit</option>
            <option value="laundry">Laundry</option>
            <option value="other">Other</option>
          </select>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Amount (₹)</label>
          <input
            type="number"
            className="apple-input"
            placeholder="Enter amount"
            value={advanceForm.amount}
            onChange={e => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
            min="1"
          />
          <div className="flex gap-12" style={{ marginTop: '8px' }}>
            <button className="apple-btn success" onClick={handleAdvancePay}>Pay Now</button>
            <button className="apple-btn ghost" onClick={() => setShowAdvance(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
