import { useState, useEffect } from 'react';
import api from '../utils/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

function TimeDisplay({ ts }) {
  if (!ts) return <span style={{ color: 'var(--muted)' }}>—</span>;
  const d = new Date(ts);
  return (
    <span>
      {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}&nbsp;
      <strong>{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong>
    </span>
  );
}

export default function Biometric() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [curfewStatus, setCurfewStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanForm, setScanForm] = useState({ studentId: '', scanType: 'ENTRY', scanLocation: 'Main Gate' });
  const [students, setStudents] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';
  const isAdmin = ['admin', 'superadmin', 'warden'].includes(user.role);
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const load = async () => {
    try {
      const params = filterDate ? `?date=${filterDate}` : '';
      const [logData, curfew] = await Promise.all([
        api.get(`/biometric${params}`),
        isStudent ? api.get(`/biometric/curfew-status/${user.id}`) : Promise.resolve(null)
      ]);
      setLogs(Array.isArray(logData) ? logData : []);
      setCurfewStatus(curfew);

      if (isAdmin) {
        const [sumData, studs] = await Promise.all([
          api.get('/biometric/today-summary'),
          api.get('/students')
        ]);
        setSummary(Array.isArray(sumData) ? sumData : []);
        setStudents(Array.isArray(studs) ? studs : (studs.students || []));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterDate]);

  const selfScan = async (type) => {
    setScanning(true);
    try {
      const res = await api.post('/biometric/scan', {
        scanType: type,
        scanLocation: 'Main Gate'
      });
      if (res.curfewViolation) {
        alert(`⚠ ${res.message}`);
      } else {
        alert(`✅ ${res.message}`);
      }
      load();
    } catch (e) {
      alert(e.error || 'Scan failed');
    } finally { setScanning(false); }
  };

  const adminScan = async () => {
    if (!scanForm.studentId) { alert('Select a student'); return; }
    setScanning(true);
    try {
      const res = await api.post('/biometric/scan', {
        studentId: Number(scanForm.studentId),
        scanType: scanForm.scanType,
        scanLocation: scanForm.scanLocation
      });
      if (res.curfewViolation) {
        alert(`⚠ ${res.message}`);
      } else {
        alert(`✅ ${res.message}`);
      }
      setShowScanModal(false);
      load();
    } catch (e) {
      alert(e.error || 'Scan failed');
    } finally { setScanning(false); }
  };

  if (loading) return <div className="fade-in">Loading biometric data…</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <div>
          <h1 className="page-header" style={{ margin: 0 }}>🔐 Biometric Access</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
            {isStudent ? 'Your entry/exit logs and curfew status.' : 'Student attendance and gate access logs.'}
          </p>
        </div>
        {isStudent ? (
          <div className="flex gap-12">
            <button
              className="apple-btn success"
              onClick={() => selfScan('ENTRY')}
              disabled={scanning}
              style={{ minWidth: '110px' }}
            >
              {scanning ? '…' : '→ ENTRY'}
            </button>
            <button
              className="apple-btn danger"
              onClick={() => selfScan('EXIT')}
              disabled={scanning}
              style={{ minWidth: '110px' }}
            >
              {scanning ? '…' : '← EXIT'}
            </button>
          </div>
        ) : (
          <button className="apple-btn" onClick={() => setShowScanModal(true)}>+ Log Scan</button>
        )}
      </div>

      {/* Student: Curfew Status Banner */}
      {isStudent && curfewStatus?.hasCurfew && (
        <div className="info-box mb-24" style={{ background: 'rgba(255,59,48,.08)', borderColor: 'rgba(255,59,48,.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: 'var(--danger)' }}>⚠ Curfew Restriction Active</strong>
              <div style={{ marginTop: '4px', fontSize: '13px' }}>
                You must return to hostel by{' '}
                <strong style={{ fontSize: '18px', color: 'var(--danger)' }}>
                  {(() => {
                    const [h, m] = (curfewStatus.curfewTime || '21:30').split(':').map(Number);
                    const suffix = h >= 12 ? 'PM' : 'AM';
                    const h12 = h % 12 || 12;
                    return `${h12}:${String(m).padStart(2,'0')} ${suffix}`;
                  })()}
                </strong>
                {' '}— Exits after this time will incur a ₹50 fine.
              </div>
            </div>
            <div style={{
              fontSize: '28px', fontWeight: 800, color: 'var(--danger)',
              opacity: .7, letterSpacing: '-1px', whiteSpace: 'nowrap'
            }}>
              {(() => {
                const [h, m] = (curfewStatus.curfewTime || '21:30').split(':').map(Number);
                const suffix = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${String(m).padStart(2,'0')} ${suffix}`;
              })()}
            </div>
          </div>
        </div>
      )}

      {isStudent && !curfewStatus?.hasCurfew && (
        <div className="info-box mb-24" style={{ background: 'rgba(52,199,89,.08)', borderColor: 'rgba(52,199,89,.25)' }}>
          ✅ No curfew restrictions on your account. Standard hostel timings apply (11:00 PM).
        </div>
      )}

      {/* Admin: Today's Attendance Summary */}
      {isAdmin && summary.length > 0 && (
        <>
          <h3 style={{ marginBottom: '12px' }}>Today's Attendance</h3>
          <div className="glass table-wrap" style={{ marginBottom: '28px' }}>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Last Entry</th>
                  <th>Last Exit</th>
                  <th>Entries Today</th>
                  <th>Fines Today</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td><TimeDisplay ts={s.lastEntry} /></td>
                    <td><TimeDisplay ts={s.lastExit} /></td>
                    <td>
                      <span style={{
                        background: s.entriesToday > 0 ? 'rgba(52,199,89,.15)' : 'rgba(120,120,128,.1)',
                        color: s.entriesToday > 0 ? 'var(--success)' : 'var(--muted)',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '13px'
                      }}>
                        {s.entriesToday || 0}
                      </span>
                    </td>
                    <td>
                      {s.finesToday > 0 ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠ {s.finesToday}</span>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Log filter */}
      <div className="flex justify-between items-center mb-16">
        <h3>
          {isStudent ? 'My Access Log' : 'All Biometric Logs'}
        </h3>
        <input
          type="date"
          className="apple-input"
          style={{ width: 'auto', marginBottom: 0 }}
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          placeholder="Filter by date"
        />
      </div>

      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              {isAdmin && <th>Student</th>}
              <th>Type</th>
              <th>Location</th>
              <th>Timestamp</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.logId}>
                {isAdmin && <td>{log.studentName}</td>}
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                    background: log.scanType === 'ENTRY'
                      ? 'rgba(52,199,89,.15)' : 'rgba(255,59,48,.12)',
                    color: log.scanType === 'ENTRY' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {log.scanType === 'ENTRY' ? '→ IN' : '← OUT'}
                  </span>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{log.scanLocation || 'Main Gate'}</td>
                <td><TimeDisplay ts={log.logTimestamp} /></td>
                <td>
                  {log.fineAmount > 0 ? (
                    <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '13px' }}>
                      {fmt(log.fineAmount)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                No biometric logs found{filterDate ? ` for ${filterDate}` : ''}.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Scan Modal */}
      {showScanModal && (
        <Modal title="Log Biometric Scan" onClose={() => setShowScanModal(false)}>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Student *</label>
          <select className="apple-input" value={scanForm.studentId} onChange={e => setScanForm({ ...scanForm, studentId: e.target.value })}>
            <option value="">— Select Student —</option>
            {students.map(s => <option key={s.studentId} value={s.studentId}>{s.name}</option>)}
          </select>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Scan Type</label>
          <select className="apple-input" value={scanForm.scanType} onChange={e => setScanForm({ ...scanForm, scanType: e.target.value })}>
            <option value="ENTRY">→ ENTRY (Coming In)</option>
            <option value="EXIT">← EXIT (Going Out)</option>
          </select>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Location</label>
          <select className="apple-input" value={scanForm.scanLocation} onChange={e => setScanForm({ ...scanForm, scanLocation: e.target.value })}>
            <option value="Main Gate">Main Gate</option>
            <option value="Block A Gate">Block A Gate</option>
            <option value="Block B Gate">Block B Gate</option>
            <option value="Side Entrance">Side Entrance</option>
          </select>
          <div className="flex gap-12" style={{ marginTop: '8px' }}>
            <button className="apple-btn" onClick={adminScan} disabled={scanning}>
              {scanning ? 'Logging…' : 'Log Scan'}
            </button>
            <button className="apple-btn ghost" onClick={() => setShowScanModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
