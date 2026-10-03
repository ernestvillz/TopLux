import { SignJWT, jwtVerify } from 'jose';
import { query } from './db.js';

const COOKIE_NAME = 'toplux_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of 32+ characters');
  }

  return new TextEncoder().encode(secret);
}

function isSecureEnv() {
  // Vercel sets VERCEL_ENV on deployments; plain-http local servers skip Secure.
  return process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
}

function cookieString(value, maxAge) {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax'
  ];

  if (isSecureEnv()) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export async function startSession(res, user) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());

  res.setHeader('Set-Cookie', cookieString(token, MAX_AGE_SECONDS));
}

export function endSession(res) {
  res.setHeader('Set-Cookie', cookieString('', 0));
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';

  for (const part of header.split(';')) {
    const index = part.indexOf('=');

    if (index === -1) continue;

    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }

  return null;
}

// Returns the logged-in user row, or null.
export async function getCurrentUser(req) {
  const token = readCookie(req, COOKIE_NAME);

  if (!token) return null;

  let userId;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    userId = payload.sub;
  } catch {
    return null; // expired or tampered token
  }

  // Database errors are NOT swallowed here: an outage should be an error,
  // not a silent logout.
  const { rows } = await query(
    'SELECT id, email, name FROM users WHERE id = $1',
    [userId]
  );

  return rows[0] || null;
}

// What the browser is allowed to see about a user.
export function publicUser(user) {
  return {
    uid: user.id,
    email: user.email,
    displayName: user.name || ''
  };
}
