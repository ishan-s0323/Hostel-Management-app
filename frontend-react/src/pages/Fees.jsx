import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [paying, setPaying] = useState(null);
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
      alert(e.error || 'Payment failed');
    }
  };

  const pending = fees.filter(f => ['pending', 'overdue'].includes(f.status));
  const paid = fees.filter(f => f.status === 'paid');

  if (loading) return <div className="fade-in">Loading fees…</div>;

  return (
    <div className="fade-in">
      <h1 className="page-header">Fees</h1>

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
          ✅ All fees are paid. No dues pending.
        </div>
      )}

      <h3 style={{ marginBottom: '16px' }}>
        {isStudent ? 'Fee History' : 'All Fee Records'}
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
              {!isStudent && <th>Action</th>}
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
                {!isStudent && (
                  <td>
                    {['pending', 'overdue'].includes(fee.status) && (
                      <button className="apple-btn" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setPaying(fee)}>
                        Mark Paid
                      </button>
                    )}
                  </td>
                )}
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
    </div>
  );
}
