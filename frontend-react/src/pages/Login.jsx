import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { 
        email, 
        password, 
        userType: role === 'superadmin' ? 'admin' : role 
      });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/');
    } catch (err) {
      setError(err.error || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-form glass mac-window">
        <h1>Smart Hostel</h1>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <select 
            className="apple-input" 
            value={role} 
            onChange={e => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="admin">Administrator</option>
            <option value="superadmin">Super Admin</option>
          </select>
          
          <input 
            type="email" 
            placeholder="Email Address" 
            className="apple-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            className="apple-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="apple-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
