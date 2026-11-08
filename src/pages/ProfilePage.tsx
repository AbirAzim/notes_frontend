import { useState, type SubmitEvent } from 'react';
import { api, errorMessage } from '../api';
import { useAuth } from '../auth';
import type { User } from '../types';
import { useFetch } from '../useFetch';

// "chess, , reading " → ["chess", "reading"]
function parseInterests(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

function ProfileForm({ user }: { user: User }) {
  const { updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [interests, setInterests] = useState(user.interests.join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api<User>('/users/me', {
        method: 'PATCH',
        body: { name, interests: parseInterests(interests) },
      });
      updateUser(updated); // updates the name in the nav
      setName(updated.name);
      setInterests(updated.interests.join(', '));
      setSuccess('Profile saved');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="card">
        <h1>Profile</h1>
        <dl className="details">
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Role</dt>
          <dd>{user.role}</dd>
          <dt>Verified</dt>
          <dd>{user.emailVerified ? 'Yes' : 'No'}</dd>
        </dl>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <h2>Edit profile</h2>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Interests (comma separated)
          <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="chess, reading" />
        </label>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ProfilePage() {
  const { data: user, loading, error } = useFetch<User>('/users/me');

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error">{error.message}</p>;
  if (!user) return null;
  return <ProfileForm user={user} />;
}
