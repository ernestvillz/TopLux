import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';

// bcrypt silently ignores everything past 72 bytes, so pre-hash first.
function prehash(password) {
  return createHash('sha256').update(password).digest('base64');
}

export function hashPassword(password) {
  return bcrypt.hash(prehash(password), 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(prehash(password), hash);
}

// Compared against when the email is unknown, so "no such user" and
// "wrong password" take about the same time.
export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);
