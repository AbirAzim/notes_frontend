# Notes Frontend — project brief

Follow this brief in every session. Phase 1 is done; build later phases only when asked.
Each phase's original brief is kept in `Phases/` (phase1.md, phase2.md, …). When asked to do a phase, read its file there.

## Stack
Vite + React + TypeScript + react-router-dom. Keep it minimal and readable: function components and hooks, React Router, fetch, one plain CSS file (src/index.css). No UI libraries, no state libraries, no axios, no React Query. The owner is a backend developer and must be able to explain every file.

## API contract
Base URL from env: `import.meta.env.VITE_API_URL`
- .env.development → VITE_API_URL=http://localhost:3000/api/v1
- .env.production  → VITE_API_URL=https://note-backend.myftp.org/api/v1
(These contain no secrets; commit them.)

Auth: send `Authorization: Bearer <accessToken>` on protected calls.
Errors are always JSON: { statusCode, message, requestId }. Show `message` to the user.
DELETE returns 204 with no body.
Lists return: { data: T[], page, limit, total, totalPages, _links: { self, first, last, prev?, next? } }
Query params on every list: page (default 1), limit (default 10, max 100).
Resources include `_links`. Show Edit/Delete buttons only when `_links.update` / `_links.delete` exist. Never hard-code permission rules in the UI.

Endpoints:
- POST /auth/register {name, email, password(8-72)} → 201 {message}. A verification email is sent.
- POST /auth/verify-email {token} → 200 {message}
- POST /auth/resend-verification {email} → 200 {message}
- POST /auth/login {email, password} → 200 { accessToken, user: { _id, name, email, role: 'USER'|'ADMIN', emailVerified, interests: string[] } }
  401 = wrong email/password, 403 = email not verified
- GET /users/me → user
- PATCH /users/me {name?, interests?: string[]} → user
- GET /users/grouped-by-interests?interests=chess,reading&page&limit → list of { interest, count, users: [{ _id, name }] }
- GET /users/:id/posts?page&limit → { user: { _id, name }, data: Post[], page, limit, total, totalPages, _links }
- POST /notes {title(1-200), content?(max 10000)} → 201 note
- GET /notes?page&limit → my notes, newest first
- GET/PATCH/DELETE /notes/:id → Note { _id, owner, title, content, createdAt, updatedAt, _links }
- POST /posts {title(1-200), body(1-10000)} → 201 post
- GET/PATCH/DELETE /posts/:id → Post { _id, author, title, body, createdAt, updatedAt, _links }
- GET /admin/users?page&limit → list of users with _links (no `delete` link on the admin's own row)
- PATCH /admin/users/:id {name?, role?, interests?} → user (an admin can't demote themselves)
- DELETE /admin/users/:id → 204 (also deletes their notes and posts)
- GET /admin/notes?page&limit → list of notes where owner is { _id, name } or null

## Rules
- src/api.ts: one `api<T>(path, { method, body })` helper. It adds the JSON and auth headers, returns parsed JSON (undefined for 204), and throws an ApiError(status, message) on failure. On 401 from a non-/auth route it clears the session and redirects to /login?expired=1.
- src/types.ts: TypeScript types for User, Note, Post, Paginated<T>, Links, InterestGroup.
- src/auth.tsx: AuthContext + AuthProvider + useAuth() holding { user, token, login(token, user), logout(), updateUser(user) }, persisted to localStorage (reads wrapped in try/catch).
- src/components/RequireAuth.tsx (redirects to /login) and RequireAdmin (redirects to /notes when not ADMIN).
- src/components/Layout.tsx: top nav with NavLink to Notes, Profile, Interest groups, My posts, Admin (only if ADMIN), plus the user's name and Logout; <Outlet/> below.
- src/components/Pager.tsx: Prev / "Page X of Y" / Next.
- Never use dangerouslySetInnerHTML.
- Every page shows loading, empty and error states. Dates via toLocaleString().
- One src/index.css: clean, minimal, mobile-friendly (max-width container, cards, forms, buttons, error/success messages, responsive tables). No CSS frameworks.
- vercel.json with a rewrite of all paths to /index.html so client routes like /verify-email work on refresh.

## Routes
/login, /verify-email (public) · /notes, /profile, /groups, /users/:id/posts, /posts (my posts) (logged in) · /admin (admin) · / → /notes

## Phase 1 scope (build ONLY this now)
- CLAUDE.md, .env.development, .env.production, vercel.json, src/types.ts, src/api.ts, src/auth.tsx, RequireAuth, RequireAdmin, Layout, Pager, index.css, router setup in main.tsx/App.tsx
- /login page: Login and Register forms side by side (stacked on mobile).
  - Register success → show the API message.
  - Login success → save the session → navigate to /notes.
  - Login 403 → show the message plus a "Resend verification email" button using the entered email.
  - Already logged in → redirect to /notes. ?expired=1 → show "Session expired, please log in again".
- /verify-email: read ?token=, call the API once on mount, show success with a link to log in, or the error.
- /notes: placeholder "Notes coming soon" inside the Layout, so login can be tested.
- README.md: short. What it is, `npm install`, `npm run dev`, env vars, deployed on Vercel.


## Checks
Both `npm run build` and `npm run lint` must pass.
