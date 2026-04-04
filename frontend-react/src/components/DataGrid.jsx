import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function DataGrid({ endpoint, title, dataKey }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(endpoint);
        // Sometimes data is nested like { students: [...] }, sometimes just [...]
        const items = dataKey && res[dataKey] ? res[dataKey] : (Array.isArray(res) ? res : res.data || []);
        setData(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint, dataKey]);

  if (loading) return <div>Loading {title}...</div>;

  if (!data || data.length === 0) {
    return (
      <div className="fade-in">
        <h1 className="page-header">{title}</h1>
        <div className="glass mac-window" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No records found for {title}.</p>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 className="page-header">{title}</h1>
      
      <div className="glass mac-window" style={{ flex: 1, overflow: 'auto' }}>
        <table className="table-glass">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={{ textTransform: 'capitalize' }}>{col.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col}>{String(row[col] || '-')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
