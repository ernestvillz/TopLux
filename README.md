# Top Lux — Luxury Car Dealership

Static front end (`public/`) + Vercel serverless API (`api/`) + Postgres (Neon).

| Piece | Technology |
|---|---|
| Hosting / deployment | Vercel |
| Front end | HTML, CSS, vanilla JS, Google Fonts CDN |
| Backend | Vercel Functions (Node.js) in `api/` |
| Database | Postgres via Neon (Vercel Marketplace) |
| Auth | Email + password (bcrypt), signed JWT in an HttpOnly cookie |

## Project layout

```
public/              the website (index.html, styles.css, assets/, backend.js)
api/auth/*.js        signup, login, logout, me
api/reservations.js  save a viewing reservation (login required)
lib/                 shared DB, session and password helpers
schema.sql           tables (also created automatically on first request)
```

## API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | create account `{email, password, name}` and log in |
| POST | `/api/auth/login` | log in `{email, password}` |
| POST | `/api/auth/logout` | clear session |
| GET | `/api/auth/me` | current user or `null` |
| POST | `/api/reservations` | save reservation (must be logged in) |

## Deploy on Vercel

1. Push this folder to a GitHub repo and **Import** it in Vercel (Framework preset: *Other*; no build command needed).
2. In the project's **Storage** tab, add **Neon (Postgres)** from the Marketplace and connect it to the project. This adds `DATABASE_URL` automatically.
3. In **Settings → Environment Variables**, add `JWT_SECRET` (a random 32+ character string) for Production, Preview and Development.
4. Deploy (or **Redeploy** if you added the variables after the first deploy).

The tables are created automatically the first time the API is called.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and JWT_SECRET
npx vercel dev
```

Open the URL it prints. Opening `index.html` directly shows the page, but login and booking need the API running.

## Viewing reservations

Open the Neon SQL editor (Vercel → Storage → your database → Open in Neon) and run:

```sql
SELECT created_at, customer_name, customer_email, vehicle_name, date, time, note, status
FROM reservations ORDER BY created_at DESC;
```
