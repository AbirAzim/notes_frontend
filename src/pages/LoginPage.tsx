import { useState, type SubmitEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api, ApiError, errorMessage } from '../api';
import { useAuth } from '../auth';
import type { LoginResponse, MessageResponse } from '../types';

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notVerified, setNotVerified] = useState(false);
  const [info, setInfo] = useState('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    setNotVerified(false);
    try {
      const res = await api<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } });
      login(res.accessToken, res.user);
      navigate('/notes');
    } catch (err) {
      setError(errorMessage(err));
      setNotVerified(err instanceof ApiError && err.status === 403);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    try {
      const res = await api<MessageResponse>('/auth/resend-verification', { method: 'POST', body: { email } });
      setInfo(res.message);
      setNotVerified(false);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Log in</h2>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error && <p className="error">{error}</p>}
      {notVerified && (
        <button type="button" className="secondary" onClick={handleResend}>
          Resend verification email
        </button>
      )}
      {info && <p className="success">{info}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api<MessageResponse>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      setSuccess(res.message);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Password (8–72 characters)
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          maxLength={72}
          required
        />
      </label>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  const { token } = useAuth();
  const [params] = useSearchParams();

  if (token) return <Navigate to="/notes" replace />;

  return (
    <main className="container">
      <h1>Notes</h1>
      {params.get('expired') === '1' && <p className="error">Session expired, please log in again</p>}
      <div className="two-col">
        <LoginForm />
        <RegisterForm />
      </div>
    </main>
  );
}
