# Notes Frontend

A small React + TypeScript (Vite) frontend for the Notes REST API: register, verify email, log in, and (in later phases) manage notes, posts, profile and admin pages.

## Run locally

```bash
npm install
npm run dev
```

Opens on http://localhost:5173.

## Environment variables

| Variable       | Purpose               |
| -------------- | --------------------- |
| `VITE_API_URL` | Base URL of the API   |

- `.env.development` → `http://localhost:3000/api/v1`
- `.env.production` → `https://note-backend.myftp.org/api/v1`

## Deploy

Deployed on Vercel. `vercel.json` rewrites every path to `index.html` so client routes like `/verify-email` work on refresh.
