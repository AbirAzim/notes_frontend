import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { MessageResponse } from '../types';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [loading, setLoading] = useState(Boolean(token));
  const [message, setMessage] = useState('');
  const [error, setError] = useState(token ? '' : 'Missing verification token.');
  // React StrictMode runs effects twice in dev; the token is single-use, so call the API only once.
  const called = useRef(false);

  useEffect(() => {
    if (!token || called.current) return;
    called.current = true;
    api<MessageResponse>('/auth/verify-email', { method: 'POST', body: { token } })
      .then((res) => setMessage(res.message))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <main className="container">
      <div className="card narrow">
        <h1>Email verification</h1>
        {loading && <p>Verifying…</p>}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        {!loading && (
          <p>
            <Link to="/login">Go to login</Link>
          </p>
        )}
      </div>
    </main>
  );
}
