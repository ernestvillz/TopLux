// Browser client for the Top Lux API (replaces the Firebase SDK).
// Errors carry a `code` (e.g. "auth/invalid-credential") so the existing
// error-message handling in index.html keeps working unchanged.

async function request(path, { method = 'GET', body } = {}) {
    let response;

    try {
        response = await fetch(path, {
            method,
            credentials: 'same-origin',
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        const error = new Error('Network request failed.');
        error.code = 'network/request-failed';
        throw error;
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        /* non-JSON response */
    }

    if (!response.ok) {
        const error = new Error(data?.error?.message || 'Request failed.');
        error.code = data?.error?.code || 'server/internal';
        error.status = response.status;
        throw error;
    }

    return data;
}

// ---- Auth state -----------------------------------------------------------

export const auth = { currentUser: null };

const listeners = new Set();
let initialised = false;

function setUser(user) {
    auth.currentUser = user;
    listeners.forEach((callback) => callback(user));
}

// Same call shape as before: onAuthStateChanged(auth, callback)
export function onAuthStateChanged(_auth, callback) {
    listeners.add(callback);

    if (initialised) {
        callback(auth.currentUser);
    }

    return () => listeners.delete(callback);
}

// Restore the session (cookie) on page load.
request('/api/auth/me')
    .then((data) => data.user)
    .catch(() => null)
    .then((user) => {
        initialised = true;
        setUser(user);
    });

// ---- Auth actions ---------------------------------------------------------

export async function createAccount({ email, password, name }) {
    const data = await request('/api/auth/signup', {
        method: 'POST',
        body: { email, password, name }
    });

    setUser(data.user);
    return data.user;
}

export async function signIn({ email, password }) {
    const data = await request('/api/auth/login', {
        method: 'POST',
        body: { email, password }
    });

    setUser(data.user);
    return data.user;
}

export async function signOut() {
    await request('/api/auth/logout', { method: 'POST' });
    setUser(null);
}

// ---- Reservations ---------------------------------------------------------

export function createReservation(reservation) {
    return request('/api/reservations', {
        method: 'POST',
        body: reservation
    });
}
