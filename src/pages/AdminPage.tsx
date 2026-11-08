import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { useAuth } from '../auth';
import Pager from '../components/Pager';
import type { Note, Paginated, Role, User } from '../types';
import { useFetch } from '../useFetch';

const LIMIT = 10;

function shorten(text: string, max = 100): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export default function AdminPage() {
  const { user: me } = useAuth();
  const [tab, setTab] = useState<'users' | 'notes'>('users');

  // Both lists live here so a user delete can refresh both.
  const [usersPage, setUsersPage] = useState(1);
  const users = useFetch<Paginated<User>>(`/admin/users?page=${usersPage}&limit=${LIMIT}`);
  const [notesPage, setNotesPage] = useState(1);
  const notes = useFetch<Paginated<Note>>(`/admin/notes?page=${notesPage}&limit=${LIMIT}`);

  // Role changes: show the new value right away, undo it if the API refuses.
  const [pendingRoles, setPendingRoles] = useState<Record<string, Role>>({});
  const [actionError, setActionError] = useState('');

  function clearPending(id: string) {
    setPendingRoles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function changeRole(user: User, role: Role) {
    setActionError('');
    setPendingRoles((prev) => ({ ...prev, [user._id]: role }));
    try {
      await api<User>(`/admin/users/${user._id}`, { method: 'PATCH', body: { role } });
      users.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      clearPending(user._id); // success: reloaded data has the new role; failure: back to the old one
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`Delete ${user.name}? Their notes and posts will be deleted too.`)) return;
    setActionError('');
    try {
      await api<void>(`/admin/users/${user._id}`, { method: 'DELETE' });
      if (users.data && users.data.data.length === 1 && usersPage > 1) setUsersPage(usersPage - 1);
      else users.reload();
      notes.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <>
      <h1>Admin</h1>
      <div className="tabs">
        <button className={tab === 'users' ? 'active' : 'secondary'} onClick={() => setTab('users')}>
          Users
        </button>
        <button className={tab === 'notes' ? 'active' : 'secondary'} onClick={() => setTab('notes')}>
          All notes
        </button>
      </div>

      {actionError && <p className="error">{actionError}</p>}

      {tab === 'users' && (
        <>
          {users.error && <p className="error">{users.error.message}</p>}
          {users.loading && <p className="muted">Loading…</p>}
          {!users.loading && !users.error && users.data?.data.length === 0 && <p className="muted">No users</p>}
          {!users.loading && !users.error && users.data && users.data.data.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Interests</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.data.map((u) => {
                    const isMe = u._id === me?._id;
                    const pending = pendingRoles[u._id];
                    return (
                      <tr key={u._id}>
                        <td>
                          {u.name}
                          {isMe && <span className="muted"> (you)</span>}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            value={pending ?? u.role}
                            disabled={isMe || pending !== undefined}
                            onChange={(e) => changeRole(u, e.target.value as Role)}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>{u.emailVerified ? 'Yes' : 'No'}</td>
                        <td>{u.interests.join(', ')}</td>
                        <td className="row-actions">
                          <Link to={`/users/${u._id}/posts`}>Posts</Link>
                          {u._links?.delete && (
                            <button className="danger" onClick={() => deleteUser(u)}>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {users.data && <Pager page={usersPage} totalPages={users.data.totalPages} onChange={setUsersPage} />}
        </>
      )}

      {tab === 'notes' && (
        <>
          {notes.error && <p className="error">{notes.error.message}</p>}
          {notes.loading && <p className="muted">Loading…</p>}
          {!notes.loading && !notes.error && notes.data?.data.length === 0 && <p className="muted">No notes</p>}
          {!notes.loading && !notes.error && notes.data && notes.data.data.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Created</th>
                    <th>Content</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.data.data.map((n) => (
                    <tr key={n._id}>
                      <td>{n.title}</td>
                      <td>
                        {n.owner === null ? (
                          <span className="muted">Deleted user</span>
                        ) : typeof n.owner === 'string' ? (
                          n.owner
                        ) : (
                          n.owner.name
                        )}
                      </td>
                      <td>{new Date(n.createdAt).toLocaleString()}</td>
                      <td>{shorten(n.content ?? '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {notes.data && <Pager page={notesPage} totalPages={notes.data.totalPages} onChange={setNotesPage} />}
        </>
      )}
    </>
  );
}
