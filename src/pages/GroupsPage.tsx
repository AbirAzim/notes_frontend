import { useState, type SubmitEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pager from '../components/Pager';
import type { InterestGroup, Paginated } from '../types';
import { useFetch } from '../useFetch';

const LIMIT = 10;

export default function GroupsPage() {
  // The URL is the source of truth: /groups?interests=chess,reading&page=2
  const [searchParams, setSearchParams] = useSearchParams();
  const interests = searchParams.get('interests') ?? '';
  const page = Number(searchParams.get('page')) || 1;

  const [filter, setFilter] = useState(interests);

  const query = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (interests) query.set('interests', interests);
  const { data: result, loading, error } = useFetch<Paginated<InterestGroup>>(
    `/users/grouped-by-interests?${query}`,
  );

  function updateUrl(newInterests: string, newPage: number) {
    const params: Record<string, string> = {};
    if (newInterests) params.interests = newInterests;
    if (newPage > 1) params.page = String(newPage);
    setSearchParams(params);
  }

  function handleSearch(e: SubmitEvent) {
    e.preventDefault();
    // Tidy "chess , reading," into "chess,reading"
    const cleaned = filter
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .join(',');
    setFilter(cleaned);
    updateUrl(cleaned, 1);
  }

  function handleClear() {
    setFilter('');
    updateUrl('', 1);
  }

  return (
    <>
      <h1>Interest groups</h1>

      <form className="card filter" onSubmit={handleSearch}>
        <label>
          Filter by interests (comma separated)
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="chess, reading" />
        </label>
        <div className="actions">
          <button type="submit">Search</button>
          <button type="button" className="secondary" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>

      {error && <p className="error">{error.message}</p>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && !error && result && (
        <>
          <p className="muted">
            {result.total} {result.total === 1 ? 'group' : 'groups'}
          </p>
          {result.data.length === 0 && <p className="muted">No groups found</p>}
          {result.data.map((group) => (
            <article key={group.interest} className="card">
              <h3>
                {group.interest} <span className="muted small">({group.count})</span>
              </h3>
              <ul className="inline-list">
                {group.users.map((u) => (
                  <li key={u._id}>
                    <Link to={`/users/${u._id}/posts`}>{u.name}</Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <Pager page={page} totalPages={result.totalPages} onChange={(p) => updateUrl(interests, p)} />
        </>
      )}
    </>
  );
}
