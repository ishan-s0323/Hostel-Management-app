const colors = {
  pending:    { bg: '#fff3cd', text: '#856404' },
  open:       { bg: '#fff3cd', text: '#856404' },
  processing: { bg: '#cce5ff', text: '#004085' },
  in_progress:{ bg: '#cce5ff', text: '#004085' },
  resolved:   { bg: '#d4edda', text: '#155724' },
  closed:     { bg: '#d4edda', text: '#155724' },
  paid:       { bg: '#d4edda', text: '#155724' },
  overdue:    { bg: '#f8d7da', text: '#721c24' },
  active:     { bg: '#d4edda', text: '#155724' },
  available:  { bg: '#d4edda', text: '#155724' },
  collected:  { bg: '#d4edda', text: '#155724' },
  found:      { bg: '#d4edda', text: '#155724' },
  washing:    { bg: '#cce5ff', text: '#004085' },
  ready:      { bg: '#d4edda', text: '#155724' },
};

export default function Badge({ status }) {
  const s = (status || 'pending').toLowerCase();
  const style = colors[s] || { bg: '#e2e3e5', text: '#383d41' };
  return (
    <span style={{
      background: style.bg, color: style.text,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 600, textTransform: 'capitalize'
    }}>
      {s.replace('_', ' ')}
    </span>
  );
}
