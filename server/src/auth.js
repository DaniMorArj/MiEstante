import jwt from 'jsonwebtoken';

const SECRET = process.env.AUTH_SECRET || 'cambia-esto-en-produccion';
const COOKIE_NAME = 'mi_estante_session';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export function checkCredentials(username, password) {
  const okUser = process.env.AUTH_USERNAME || 'admin';
  const okPass = process.env.AUTH_PASSWORD;
  if (!okPass) {
    // Si no se ha configurado ninguna contraseña, no bloqueamos el acceso
    // (útil en desarrollo local), pero avisamos por consola.
    console.warn('AVISO: AUTH_PASSWORD no está configurada — el login está desactivado.');
    return true;
  }
  return username === okUser && password === okPass;
}

export function authEnabled() {
  return Boolean(process.env.AUTH_PASSWORD);
}

export function issueSession(res) {
  const token = jwt.sign({ ok: true }, SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: THIRTY_DAYS,
  });
}

export function clearSession(res) {
  res.clearCookie(COOKIE_NAME);
}

export function hasValidSession(req) {
  if (!authEnabled()) return true;
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return false;
  try {
    jwt.verify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export function requireAuth(req, res, next) {
  if (hasValidSession(req)) return next();
  res.status(401).json({ error: 'No has iniciado sesión' });
}
