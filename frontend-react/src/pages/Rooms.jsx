import { useState, useEffect } from 'react';
import api from '../utils/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const applyForRoom = async (roomId) => {
    try {
      await api.post('/allocations', { studentId: user.id, roomId });
      alert('Room application submitted!');
      setApplying(null);
      load();
    } catch (e) {
      alert(e.error || 'Failed to apply');
    }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  if (loading) return <div className="fade-in">Loading rooms…</div>;

  return (
    <div className="fade-in">
      <h1 className="page-header">Rooms</h1>
      {isStudent && <p className="page-sub">Browse available rooms and submit a room application.</p>}

      <div className="card-grid">
        {rooms.map(room => (
          <div key={room.roomId} className="room-card glass">
            <div className="flex justify-between items-center mb-16">
              <h3>Room {room.roomId}</h3>
              <Badge status={room.availabilityStatus} />
            </div>
            <div className="meta">
              <div><strong>Block:</strong> {room.blockName}</div>
              <div><strong>Floor:</strong> {room.floorNum}</div>
              <div><strong>Type:</strong> {room.roomType}</div>
              <div><strong>Capacity:</strong> {room.currentOccupancy}/{room.capacity}</div>
              <div><strong>Rent:</strong> {fmt(room.rentPerMonth)}/month</div>
            </div>
            {isStudent && room.availabilityStatus === 'available' && room.currentOccupancy < room.capacity && (
              <button className="apple-btn full" onClick={() => setApplying(room)}>
                Apply for this Room
              </button>
            )}
          </div>
        ))}
        {rooms.length === 0 && (
          <p className="text-muted">No rooms found.</p>
        )}
      </div>

      {applying && (
        <Modal title={`Apply for Room ${applying.roomId}`} onClose={() => setApplying(null)}>
          <div className="info-box mb-24">
            <strong>Block:</strong> {applying.blockName} &nbsp;│&nbsp;
            <strong>Type:</strong> {applying.roomType} &nbsp;│&nbsp;
            <strong>Rent:</strong> {fmt(applying.rentPerMonth)}/month
          </div>
          <p style={{ marginBottom: '24px', color: 'var(--muted)', fontSize: '14px' }}>
            Confirm your room application. The warden/admin will approve your allocation.
          </p>
          <div className="flex gap-12">
            <button className="apple-btn" onClick={() => applyForRoom(applying.roomId)}>Confirm Apply</button>
            <button className="apple-btn ghost" onClick={() => setApplying(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
