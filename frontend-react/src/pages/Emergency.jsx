export default function Emergency() {
  const contacts = [
    { role: 'Warden', name: 'Dr. Rajesh Kumar', phone: '+91 98765 43210', available: '24/7', color: 'var(--accent)' },
    { role: 'Deputy Warden', name: 'Mrs. Priya Sharma', phone: '+91 98765 43211', available: '8am – 10pm', color: '#5856d6' },
    { role: 'Hostel Caretaker', name: 'Mr. Suresh', phone: '+91 98765 43212', available: '24/7', color: '#30d158' },
    { role: 'Ambulance (Hostel)', name: 'Campus Medical Centre', phone: '+91 98765 43220', available: '24/7', color: 'var(--danger)' },
    { role: 'Fire Department', name: 'Block Emergency', phone: '101', available: '24/7', color: '#ff6b35' },
    { role: 'Police', name: 'Campus Security', phone: '100', available: '24/7', color: '#6e6e73' },
    { role: 'Electrician', name: 'Mr. Ramesh', phone: '+91 98765 43230', available: '7am – 9pm', color: 'var(--warning)' },
    { role: 'Plumber / Maintenance', name: 'Facility Team', phone: '+91 98765 43231', available: '8am – 8pm', color: '#5ac8fa' },
  ];

  return (
    <div className="fade-in">
      <h1 className="page-header">Emergency Contacts</h1>
      <p className="page-sub">Keep these contacts handy for any urgent situation in the hostel.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
        {contacts.map((c, i) => (
          <div key={i} className="glass" style={{ padding: '24px', borderRadius: '14px', borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>{c.role}</div>
            <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{c.name}</div>
            <a
              href={`tel:${c.phone}`}
              style={{ fontSize: '22px', fontWeight: 700, color: c.color, textDecoration: 'none', display: 'block', marginBottom: '8px' }}
            >
              {c.phone}
            </a>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Available: {c.available}</div>
          </div>
        ))}
      </div>

      <div className="info-box" style={{ marginTop: '32px', background: 'rgba(255,59,48,.08)', borderColor: 'rgba(255,59,48,.2)' }}>
        <strong>🚨 In case of any life-threatening emergency</strong> — call the ambulance or fire department immediately. 
        Alert the warden and campus security simultaneously.
      </div>
    </div>
  );
}
