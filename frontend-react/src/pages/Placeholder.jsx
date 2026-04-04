import { useLocation } from 'react-router-dom';

export default function Placeholder() {
  const loc = useLocation();
  const moduleName = loc.pathname.replace('/', '').toUpperCase();

  return (
    <div className="fade-in">
      <h1 className="page-header">{moduleName || 'MODULE'}</h1>
      
      <div className="glass mac-window" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '16px' }}>Module Online</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          The {moduleName} module is actively connected to the Node Express Backend. 
          Use the Data-Grid interface to manage records.
        </p>
      </div>
    </div>
  );
}
