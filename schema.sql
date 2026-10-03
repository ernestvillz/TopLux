-- Optional: lib/db.js creates these automatically on first request.
-- Run this manually (Neon SQL editor) if you prefer.

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reservations (
  id               UUID PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_name    TEXT NOT NULL DEFAULT '',
  customer_email   TEXT NOT NULL,
  vehicle_name     TEXT NOT NULL,
  vehicle_price    TEXT NOT NULL DEFAULT '',
  vehicle_category TEXT NOT NULL DEFAULT '',
  vehicle_details  TEXT NOT NULL DEFAULT '',
  date             DATE NOT NULL,
  time             TIME NOT NULL,
  note             TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reservations_user_idx
  ON reservations (user_id, created_at DESC);
