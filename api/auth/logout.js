import { route, send } from '../../lib/http.js';
import { endSession } from '../../lib/session.js';

export default route(['POST'], async (req, res) => {
  endSession(res);
  send(res, 200, { ok: true });
});
