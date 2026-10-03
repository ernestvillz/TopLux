import { ensureSchema } from '../../lib/db.js';
import { route, send } from '../../lib/http.js';
import { getCurrentUser, publicUser } from '../../lib/session.js';

export default route(['GET'], async (req, res) => {
  await ensureSchema();

  const user = await getCurrentUser(req);
  send(res, 200, { user: user ? publicUser(user) : null });
});
