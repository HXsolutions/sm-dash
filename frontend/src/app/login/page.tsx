'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} className="card glass-panel" style={{ width: '400px' }}>
        <h2 className="heading" style={{ textAlign: 'center' }}>Login</h2>
        {error && <p style={{ color: 'var(--error)', margin: '0 0 1rem 0' }}>{error}</p>}
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input-field" style={{ marginTop: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-field" style={{ marginTop: '0.5rem' }} />
        </div>
        <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
      </form>
    </div>
  );
}
