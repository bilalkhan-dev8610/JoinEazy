const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Options for the httpOnly JWT cookie. `secure` is enabled automatically
 * in production (requires HTTPS); `sameSite: 'lax'` is a reasonable
 * default for a same-site-ish local/dev setup between the Vite and
 * Express dev servers.
 */
const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: Number(process.env.JWT_COOKIE_MAX_AGE_MS) || ONE_DAY_MS,
});

module.exports = { authCookieOptions };
