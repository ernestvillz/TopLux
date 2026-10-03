export class HttpError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function readBody(req) {
  const body = req.body;

  if (body && typeof body === 'object') {
    return body;
  }

  if (typeof body === 'string' && body.length) {
    try {
      return JSON.parse(body);
    } catch {
      /* fall through */
    }
  }

  throw new HttpError(400, 'request/invalid-body', 'Invalid request body.');
}

// Wraps a handler: method check + uniform JSON error responses.
export function route(methods, handler) {
  return async (req, res) => {
    if (!methods.includes(req.method)) {
      res.setHeader('Allow', methods.join(', '));
      return send(res, 405, {
        error: { code: 'request/method-not-allowed', message: 'Method not allowed.' }
      });
    }

    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof HttpError) {
        return send(res, error.status, {
          error: { code: error.code, message: error.message }
        });
      }

      console.error(error);
      send(res, 500, {
        error: { code: 'server/internal', message: 'Something went wrong.' }
      });
    }
  };
}
