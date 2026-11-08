import { useState, type SubmitEvent } from 'react';
import { useParams } from 'react-router-dom';
import { api, ApiError, errorMessage } from '../api';
import { useAuth } from '../auth';
import Pager from '../components/Pager';
import type { Post, UserPosts } from '../types';
import { useFetch } from '../useFetch';

const LIMIT = 10;

function PostList({ userId, isMine }: { userId: string; isMine: boolean }) {
  // List
  const [page, setPage] = useState(1);
  const { data: result, loading, error, reload } = useFetch<UserPosts>(
    `/users/${userId}/posts?page=${page}&limit=${LIMIT}`,
  );
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form (editingId = null means "create")
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function resetForm() {
    setTitle('');
    setBody('');
    setEditingId(null);
    setFormError('');
  }

  function startEdit(post: Post) {
    setTitle(post.title);
    setBody(post.body);
    setEditingId(post._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await api<Post>(`/posts/${editingId}`, { method: 'PATCH', body: { title, body } });
        reload();
      } else {
        await api<Post>('/posts', { method: 'POST', body: { title, body } });
        if (page === 1) reload();
        else setPage(1);
      }
      resetForm();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    setDeleteError('');
    setDeletingId(post._id);
    try {
      await api<void>(`/posts/${post._id}`, { method: 'DELETE' });
      if (editingId === post._id) resetForm();
      if (result && result.data.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (error instanceof ApiError && error.status === 404) {
    return <p className="error">User not found</p>;
  }

  return (
    <>
      {isMine && (
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit post' : 'New post'}</h2>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
          </label>
          <label>
            Body
            <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={10000} rows={5} required />
          </label>
          {formError && <p className="error">{formError}</p>}
          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add post'}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {result && <h1>Posts by {result.user.name}</h1>}
      {deleteError && <p className="error">{deleteError}</p>}
      {error && <p className="error">{error.message}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !error && result?.data.length === 0 && <p className="muted">No posts yet</p>}

      {!loading &&
        !error &&
        result?.data.map((post) => (
          <article key={post._id} className="card">
            <h3>{post.title}</h3>
            <p className="pre-wrap">{post.body}</p>
            <p className="muted small">{new Date(post.createdAt).toLocaleString()}</p>
            {(post._links.update || post._links.delete) && (
              <div className="actions">
                {post._links.update && (
                  <button className="secondary" onClick={() => startEdit(post)}>
                    Edit
                  </button>
                )}
                {post._links.delete && (
                  <button className="danger" onClick={() => handleDelete(post)} disabled={deletingId === post._id}>
                    {deletingId === post._id ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>
            )}
          </article>
        ))}

      {result && <Pager page={page} totalPages={result.totalPages} onChange={setPage} />}
    </>
  );
}

// Used by both /posts (me) and /users/:id/posts.
export default function PostsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const userId = id ?? user?._id ?? '';
  const isMine = userId === user?._id;

  // key: switching to another user starts fresh (page 1, empty form).
  return <PostList key={userId} userId={userId} isMine={isMine} />;
}
