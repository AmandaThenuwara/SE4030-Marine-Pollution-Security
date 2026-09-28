const AUTH_COOKIE_NAME = 'auth_token';

const isProduction = () => process.env.NODE_ENV === 'production';

const getSameSite = () => {
  const configured = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();
  if (isProduction() && configured === 'none') return 'none';
  return 'lax';
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: getSameSite(),
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const parseCookies = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((cookies, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) return cookies;

    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (!name) return cookies;

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
    return cookies;
  }, {});

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
  const { maxAge, ...clearOptions } = getCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, clearOptions);
};

const readAuthCookie = (req) =>
  parseCookies(req.headers.cookie || '')[AUTH_COOKIE_NAME] || null;

module.exports = {
  AUTH_COOKIE_NAME,
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
  readAuthCookie,
};
