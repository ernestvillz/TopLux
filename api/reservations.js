import { randomUUID } from 'node:crypto';
import { ensureSchema, query } from '../lib/db.js';
import { HttpError, readBody, route, send } from '../lib/http.js';
import { getCurrentUser } from '../lib/session.js';

function text(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export default route(['POST'], async (req, res) => {
  await ensureSchema();

  // Identity comes from the session cookie, never from the request body.
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError(401, 'auth/unauthenticated', 'Please log in again before confirming.');
  }

  const body = readBody(req);

  const vehicleName = text(body.vehicleName, 200);
  const date = text(body.date, 10);
  const time = text(body.time, 5);

  if (!vehicleName) {
    throw new HttpError(400, 'reservation/invalid', 'A vehicle is required.');
  }

  if (!isRealDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new HttpError(400, 'reservation/invalid', 'A valid date and time are required.');
  }

  const id = randomUUID();

  await query(
    `INSERT INTO reservations
       (id, user_id, customer_name, customer_email, vehicle_name, vehicle_price,
        vehicle_category, vehicle_details, date, time, note, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')`,
    [
      id,
      user.id,
      user.name || '',
      user.email,
      vehicleName,
      text(body.vehiclePrice, 100),
      text(body.vehicleCategory, 100),
      text(body.vehicleDetails, 300),
      date,
      time,
      text(body.note, 1000)
    ]
  );

  send(res, 201, { id, status: 'pending' });
});
