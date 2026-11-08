import { useState, type SubmitEvent } from 'react';
import { api, errorMessage } from '../api';
import Pager from '../components/Pager';
import type { Note, Paginated } from '../types';
import { useFetch } from '../useFetch';

const LIMIT = 10;

export default function NotesPage() {
  // List
  const [page, setPage] = useState(1);
  const { data: result, loading, error, reload } = useFetch<Paginated<Note>>(`/notes?page=${page}&limit=${LIMIT}`);
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form (editingId = null means "create")
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function resetForm() {
    setTitle('');
    setContent('');
    setEditingId(null);
    setFormError('');
  }

  function startEdit(note: Note) {
    setTitle(note.title);
    setContent(note.content ?? '');
    setEditingId(note._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await api<Note>(`/notes/${editingId}`, { method: 'PATCH', body: { title, content } });
        reload();
      } else {
        await api<Note>('/notes', { method: 'POST', body: { title, content } });
        // New notes are listed newest first, so show page 1.
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

  async function handleDelete(note: Note) {
    if (!confirm(`Delete "${note.title}"?`)) return;
    setDeleteError('');
    setDeletingId(note._id);
    try {
      await api<void>(`/notes/${note._id}`, { method: 'DELETE' });
      if (editingId === note._id) resetForm();
      // If that was the last note on this page, go back one page.
      if (result && result.data.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <form className="card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit note' : 'New note'}</h2>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
        </label>
        <label>
          Content
          <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={10000} rows={5} />
        </label>
        {formError && <p className="error">{formError}</p>}
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add note'}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h1>My notes</h1>
      {deleteError && <p className="error">{deleteError}</p>}
      {error && <p className="error">{error.message}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !error && result?.data.length === 0 &&<p className="muted">No notes yet</p>}

      {!loading &&
        !error &&
        result?.data.map((note) => (
          <article key={note._id} className="card">
            <h3>{note.title}</h3>
            {note.content && <p className="pre-wrap">{note.content}</p>}
            <p className="muted small">
              Created {new Date(note.createdAt).toLocaleString()}
              {note.updatedAt !== note.createdAt && ` · Updated ${new Date(note.updatedAt).toLocaleString()}`}
            </p>
            {(note._links.update || note._links.delete) && (
              <div className="actions">
                {note._links.update && (
                  <button className="secondary" onClick={() => startEdit(note)}>
                    Edit
                  </button>
                )}
                {note._links.delete && (
                  <button className="danger" onClick={() => handleDelete(note)} disabled={deletingId === note._id}>
                    {deletingId === note._id ? 'Deleting…' : 'Delete'}
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
