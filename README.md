# Notes Frontend

A small React + TypeScript (Vite) frontend for the Notes REST API: sign up, verify email, log in, write private notes and public posts, browse users by interest, and (for admins) create and manage users and see all notes.

- **Live app:** https://notes-frontend-gilt-mu.vercel.app
- **Backend API:** https://note-backend.myftp.org/api/v1
- **API docs (Swagger):** https://note-backend.myftp.org/docs

## Pages

| Route               | Access    | What it does                                                       |
| ------------------- | --------- | ------------------------------------------------------------------ |
| `/login`            | public    | Log in and register side by side; resend the verification email   |
| `/verify-email`     | public    | Opens from the email link (`?token=…`) and verifies the account    |
| `/notes`            | logged in | Create, edit, delete and page through your notes                   |
| `/profile`          | logged in | See email/role/verified; edit name and interests                   |
| `/groups`           | logged in | Users grouped by interest, filterable (filter + page kept in URL)  |
| `/posts`            | logged in | Your posts: create, edit, delete                                   |
| `/users/:id/posts`  | logged in | Another user's posts                                               |
| `/admin`            | admin     | Users tab (create user, change role, delete) and All notes tab     |

Edit/Delete buttons appear only when the API returns `_links.update` / `_links.delete`.

## Run locally

Needs Node 20+ and the backend running on `localhost:3000`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run lint
```

## Environment variables

| Variable       | Purpose             |
| -------------- | ------------------- |
| `VITE_API_URL` | Base URL of the API |

- `.env.development` → `http://localhost:3000/api/v1`
- `.env.production` → `https://note-backend.myftp.org/api/v1`

They hold no secrets, so they are committed.

## Folder structure

```
src/
  main.tsx              entry: router + auth provider
  App.tsx               all routes
  api.ts                api() fetch helper, ApiError, errorMessage()
  auth.tsx              AuthProvider + useAuth() (session in localStorage)
  useFetch.ts           useFetch(path) hook for GET requests
  types.ts              User, Note, Post, Paginated<T>, …
  index.css             all styles
  components/
    Layout.tsx          top nav + page outlet
    Pager.tsx           Prev / Page X of Y / Next
    RequireAuth.tsx     RequireAuth and RequireAdmin route guards
  pages/
    LoginPage.tsx
    VerifyEmailPage.tsx
    NotesPage.tsx
    ProfilePage.tsx
    GroupsPage.tsx
    PostsPage.tsx       used for /posts and /users/:id/posts
    AdminPage.tsx
vercel.json             sends every path to index.html (client-side routes)
```

## Deploy

Deployed on Vercel from the `main` branch. `vercel.json` rewrites every path to `index.html` so routes like `/verify-email` work on refresh.
