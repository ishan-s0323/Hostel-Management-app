import { useState, useEffect } from 'react';
import api from '../utils/api';
import Modal from '../components/Modal';

export default function Roommates() {
  const [pref, setPref] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sleepSchedule: 'early_sleeper', studyHabit: 'moderate', neatnessLevel: 'moderate' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const load = async () => {
    try {
      const [prefData, compatData] = await Promise.all([
        isStudent ? api.get('/roommates/preference') : Promise.resolve(null),
        api.get('/roommates/compatibility')
      ]);
      setPref(prefData);
      setMatches(Array.isArray(compatData) ? compatData : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, [isStudent]);

  useEffect(() => {
    if (pref) {
      setForm({
        sleepSchedule: pref.sleepSchedule || 'early_sleeper',
        studyHabit: pref.studyHabit || 'moderate',
        neatnessLevel: pref.neatnessLevel || 'moderate'
      });
    }
  }, [pref]);

  const savePreference = async () => {
    try {
      await api.post('/roommates/preference', form);
      alert('Preferences saved!');
      setShowForm(false);
      load();
    } catch (e) { alert(e.error || 'Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-24">
        <h1 className="page-header" style={{ margin: 0 }}>Roommate Matching</h1>
        {isStudent && (
          <button className="apple-btn" onClick={() => setShowForm(true)}>
            {pref ? 'Update Preferences' : 'Set Preferences'}
          </button>
        )}
      </div>

      {isStudent && pref && (
        <div className="info-box mb-24">
          <strong>Your Preferences:</strong>&nbsp;
          Sleep: <em>{pref.sleepSchedule?.replace('_', ' ')}</em> &nbsp;│&nbsp;
          Study: <em>{pref.studyHabit}</em> &nbsp;│&nbsp;
          Neatness: <em>{pref.neatnessLevel}</em>
        </div>
      )}

      {isStudent && !pref && (
        <div className="info-box mb-24" style={{ background: 'rgba(255,159,10,.1)', borderColor: 'rgba(255,159,10,.3)' }}>
          ⚡ Set your preferences to discover compatible roommates!
        </div>
      )}

      <h3 style={{ marginBottom: '16px' }}>Compatibility Matches</h3>
      <div className="glass table-wrap">
        <table className="table-glass">
          <thead>
            <tr>
              <th>Student 1</th>
              <th>Student 2</th>
              <th>Compatibility</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, i) => (
              <tr key={i}>
                <td>{m.student1Name}</td>
                <td>{m.student2Name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, background: 'var(--border)', borderRadius: '4px', height: '8px' }}>
                      <div style={{
                        width: `${m.compatibilityPercentage}%`,
                        background: m.compatibilityPercentage >= 70 ? 'var(--success)' : m.compatibilityPercentage >= 40 ? 'var(--warning)' : 'var(--danger)',
                        height: '100%', borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{m.compatibilityPercentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                No compatibility data yet. Students need to set preferences first.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Set Roommate Preferences" onClose={() => setShowForm(false)}>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Sleep Schedule</label>
          <select className="apple-input" value={form.sleepSchedule} onChange={e => setForm({ ...form, sleepSchedule: e.target.value })}>
            <option value="early_sleeper">Early Sleeper (before 10pm)</option>
            <option value="moderate">Moderate (10pm–midnight)</option>
            <option value="night_owl">Night Owl (after midnight)</option>
          </select>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Study Habit</label>
          <select className="apple-input" value={form.studyHabit} onChange={e => setForm({ ...form, studyHabit: e.target.value })}>
            <option value="light">Light Study</option>
            <option value="moderate">Moderate</option>
            <option value="intense">Intense / Exam Focus</option>
          </select>
          <label style={{ color: 'var(--muted)', fontSize: '13px' }}>Neatness Level</label>
          <select className="apple-input" value={form.neatnessLevel} onChange={e => setForm({ ...form, neatnessLevel: e.target.value })}>
            <option value="low">Relaxed</option>
            <option value="moderate">Moderate</option>
            <option value="high">Very Neat</option>
          </select>
          <div className="flex gap-12" style={{ marginTop: '8px' }}>
            <button className="apple-btn" onClick={savePreference}>Save Preferences</button>
            <button className="apple-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
