import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Dashboard() {
  const [data, setData] = useState({});
  const [me, setMe] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  useEffect(() => {
    const load = async () => {
      try {
        const endpoint = isStudent ? '/dashboard/student-stats' : '/dashboard/stats';
        const [stats, meData] = await Promise.all([
          api.get(endpoint),
          api.get('/auth/me')
        ]);
        setData(stats);
        setMe(meData);
      } catch (e) { console.error(e); }
    };
    load();
  }, [isStudent]);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="fade-in">
      <h1 className="page-header">Welcome, {user.name}</h1>

      {isStudent && data.room && (
        <div className="info-box mb-24">
          <strong>Room:</strong> {data.room.roomId} &nbsp;│&nbsp;
          <strong>Block:</strong> {data.room.blockName} &nbsp;│&nbsp;
          <strong>Floor:</strong> {data.room.floorNum} &nbsp;│&nbsp;
          <strong>Type:</strong> {data.room.roomType} &nbsp;│&nbsp;
          {me && <><strong>Dept:</strong> {me.department} &nbsp;│&nbsp; <strong>Year:</strong> {me.yearOfStudy}</>}
        </div>
      )}

      {isStudent ? (
        <div className="stat-grid">
          <div className="stat-card glass" style={{ borderTop: '3px solid var(--accent)' }}>
            <div className="label">Your Room</div>
            <div className="value" style={{ color: 'var(--accent)', fontSize: '24px' }}>
              {data.room ? `${data.room.roomId}` : 'Not Allocated'}
            </div>
            <div className="sub">{data.room?.blockName || ''}</div>
          </div>
          <div className="stat-card glass" style={{ borderTop: '3px solid var(--warning)' }}>
            <div className="label">Pending Fees</div>
            <div className="value" style={{ color: 'var(--warning)', fontSize: '22px' }}>{fmt(data.fees?.pending)}</div>
          </div>
          <div className="stat-card glass" style={{ borderTop: '3px solid var(--success)' }}>
            <div className="label">Fees Paid</div>
            <div className="value" style={{ color: 'var(--success)', fontSize: '22px' }}>{fmt(data.fees?.paid)}</div>
          </div>
          <div className="stat-card glass" style={{ borderTop: '3px solid var(--danger)' }}>
            <div className="label">Open Complaints</div>
            <div className="value" style={{ color: 'var(--danger)' }}>{data.openComplaints || 0}</div>
          </div>
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card glass" style={{ borderTop: '3px solid var(--accent)' }}>
            <div className="label">Total Students</div>
            <div className="value">{data.totalStudents || 0}</div>
          </div>
          <div className="stat-card glass" style={{ borderTop: '3px solid #5856d6' }}>
            <div className="label">Occupancy</div>
            <div className="value">{data.occupiedRooms || 0} <span style={{ fontSize: '16px', color: 'var(--muted)' }}>/ {data.totalRooms || 0}</span></div>
            <div className="sub">{data.availableRooms || 0} rooms available</div>
          </div>
          <div className="stat-card glass" style={{ borderTop: '3px solid var(--success)' }}>
            <div className="label">Fees Collected</div>
            <div className="value" style={{ color: 'var(--success)', fontSize: '20px' }}>{fmt(data.collectedFees)}</div>
            <div className="sub">Pending: {fmt(data.pendingFees)}</div>
          </div>
          <div className="stat-card glass" style={{ borderTop: '3px solid var(--danger)' }}>
            <div className="label">Open Complaints</div>
            <div className="value" style={{ color: 'var(--danger)' }}>{data.openComplaints || 0}</div>
          </div>
          <div className="stat-card glass" style={{ borderTop: '3px solid var(--warning)' }}>
            <div className="label">Active Allocations</div>
            <div className="value">{data.activeAllocations || 0}</div>
          </div>
          <div className="stat-card glass" style={{ borderTop: '3px solid #30d158' }}>
            <div className="label">Total Staff</div>
            <div className="value">{data.totalStaff || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
