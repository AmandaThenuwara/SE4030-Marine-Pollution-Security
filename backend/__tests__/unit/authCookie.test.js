const {
  AUTH_COOKIE_NAME,
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
  readAuthCookie,
} = require('../../src/utils/authCookie');

describe('auth cookie helpers', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses HttpOnly lax cookies without Secure in development', () => {
    process.env = { ...originalEnv, NODE_ENV: 'development' };
    expect(getCookieOptions()).toEqual(expect.objectContaining({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    }));
    expect(getCookieOptions()).not.toHaveProperty('domain');
  });

  it('supports secure cross-site cookies when explicitly configured in production', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      AUTH_COOKIE_SAME_SITE: 'none',
    };
    expect(getCookieOptions()).toEqual(expect.objectContaining({
      secure: true,
      sameSite: 'none',
    }));
  });

  it('sets, reads, and clears the named authentication cookie', () => {
    process.env = { ...originalEnv, NODE_ENV: 'development' };
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };

    setAuthCookie(res, 'signed.jwt.value');
    expect(res.cookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      'signed.jwt.value',
      expect.objectContaining({ httpOnly: true, path: '/' })
    );

    expect(readAuthCookie({ headers: { cookie: 'other=1; auth_token=signed.jwt.value' } }))
      .toBe('signed.jwt.value');

    clearAuthCookie(res);
    expect(res.clearCookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.objectContaining({ httpOnly: true, path: '/' })
    );
  });
});
