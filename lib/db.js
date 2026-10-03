import pg from 'pg';

// Works with any Postgres. On Vercel, add the Neon integration from the
// Marketplace (Storage tab) and it injects DATABASE_URL automatically.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool;

export function getPool() {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  if (!pool) {
    pool = new pg.Pool({
      connectionString,
      max: 1, // one connection per function instance is plenty
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000
    });
  }

  return pool;
}

export function query(text, params) {
  return getPool().query(text, params);
}

// Tables are created on first use, so there is no manual setup step.
// The same SQL lives in schema.sql if you prefer to run it yourself.
let schemaReady;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id            UUID PRIMARY KEY,
          email         TEXT NOT NULL UNIQUE,
          name          TEXT NOT NULL DEFAULT '',
          password_hash TEXT NOT NULL,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);

      await query(`
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
        )
      `);

      await query(
        'CREATE INDEX IF NOT EXISTS reservations_user_idx ON reservations (user_id, created_at DESC)'
      );
    })().catch((error) => {
      schemaReady = undefined; // retry on next request
      throw error;
    });
  }

  return schemaReady;
}
