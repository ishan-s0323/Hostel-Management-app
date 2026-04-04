import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/students', label: 'Students', icon: '👥' },
  { to: '/staff', label: 'Staff', icon: '🧑‍💼' },
  { to: '/blocks', label: 'Blocks', icon: '🏢' },
  { to: '/rooms', label: 'Rooms', icon: '🚪' },
  { to: '/allocations', label: 'Allocations', icon: '🛏️' },
  { to: '/fees', label: 'Fees', icon: '💳' },
  { to: '/payments', label: 'Payments', icon: '💰' },
  { to: '/complaints', label: 'Complaints', icon: '⚠️' },
  { to: '/inquiries', label: 'Inquiries', icon: '🔍' },
  { to: '/parcels', label: 'Parcels', icon: '📦' },
  { to: '/visitors', label: 'Visitors', icon: '🧑‍🤝‍🧑' },
  { to: '/lost-found', label: 'Lost & Found', icon: '📍' },
  { to: '/roommates', label: 'Roommates', icon: '🤝' },
  { to: '/feedback', label: 'Feedback', icon: '💬' },
  { to: '/laundry', label: 'Laundry', icon: '🧺' },
  { to: '/leaves', label: 'Room Requests', icon: '📋' },
  { to: '/emergency', label: 'Emergency', icon: '🚨' },
];

const studentLinks = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/rooms', label: 'Rooms', icon: '🚪' },
  { to: '/fees', label: 'Fees', icon: '💳' },
  { to: '/complaints', label: 'Complaints', icon: '⚠️' },
  { to: '/inquiries', label: 'Inquiries', icon: '🔍' },
  { to: '/parcels', label: 'Parcels', icon: '📦' },
  { to: '/lost-found', label: 'Lost & Found', icon: '📍' },
  { to: '/roommates', label: 'Roommates', icon: '🤝' },
  { to: '/feedback', label: 'Feedback', icon: '💬' },
  { to: '/laundry', label: 'Laundry', icon: '🧺' },
  { to: '/leaves', label: 'Room Change', icon: '📋' },
  { to: '/emergency', label: 'Emergency', icon: '🚨' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { navigate('/login'); return; }
    setUser(JSON.parse(raw));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  const links = user.role === 'student' ? studentLinks : adminLinks;

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-brand">🏠 Smart Hostel</div>
        <div className="nav-links">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '16px' }}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-footer">
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>
            {user.name}<br /><span style={{ fontSize: '11px', textTransform: 'capitalize' }}>{user.role}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', padding: 0 }}
          >
            Sign Out →
          </button>
        </div>
      </div>
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
}
