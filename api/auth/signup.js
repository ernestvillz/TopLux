import { randomUUID } from 'node:crypto';
import { ensureSchema, query } from '../../lib/db.js';
import { HttpError, readBody, route, send } from '../../lib/http.js';
import { hashPassword } from '../../lib/passwords.js';
import { publicUser, startSession } from '../../lib/session.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default route(['POST'], async (req, res) => {
  const body = readBody(req);

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const name = String(body.name ?? '').trim().slice(0, 100);

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    throw new HttpError(400, 'auth/invalid-email', 'Please enter a valid email address.');
  }

  if (password.length < 6 || password.length > 1000) {
    throw new HttpError(400, 'auth/weak-password', 'Password must be at least 6 characters.');
  }

  await ensureSchema();

  const user = { id: randomUUID(), email, name };

  try {
    await query(
      'INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, user.name, await hashPassword(password)]
    );
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(
        409,
        'auth/email-already-in-use',
        'That email is already registered. Please log in.'
      );
    }

    throw error;
  }

  await startSession(res, user);
  send(res, 201, { user: publicUser(user) });
});
