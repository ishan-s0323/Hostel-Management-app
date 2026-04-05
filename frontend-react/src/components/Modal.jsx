export default function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        backdropFilter: 'blur(8px)',
        animation: 'overlayIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass"
        style={{
          width: '480px', maxWidth: '90vw',
          padding: '32px',
          maxHeight: '85vh', overflowY: 'auto',
          animation: 'modalSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(120,120,128,.15)', border: 'none',
              color: 'var(--muted)', cursor: 'pointer',
              width: '28px', height: '28px', borderRadius: '50%',
              fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.target.style.background = 'rgba(120,120,128,.25)'}
            onMouseOut={e => e.target.style.background = 'rgba(120,120,128,.15)'}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
