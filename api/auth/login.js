import { ensureSchema, query } from '../../lib/db.js';
import { HttpError, readBody, route, send } from '../../lib/http.js';
import { DUMMY_HASH, verifyPassword } from '../../lib/passwords.js';
import { publicUser, startSession } from '../../lib/session.js';

export default route(['POST'], async (req, res) => {
  const body = readBody(req);

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!email || !password || password.length > 1000) {
    throw new HttpError(401, 'auth/invalid-credential', 'The email or password is incorrect.');
  }

  await ensureSchema();

  const { rows } = await query(
    'SELECT id, email, name, password_hash FROM users WHERE email = $1',
    [email]
  );

  const user = rows[0];
  const valid = await verifyPassword(password, user ? user.password_hash : DUMMY_HASH);

  if (!user || !valid) {
    throw new HttpError(401, 'auth/invalid-credential', 'The email or password is incorrect.');
  }

  await startSession(res, user);
  send(res, 200, { user: publicUser(user) });
});
