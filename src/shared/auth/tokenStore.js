import { Capacitor } from '@capacitor/core';

// Native builds can't rely on cookies: iOS WKWebView drops the cross-subdomain
// SameSite=Strict auth cookies set by auth-service, so the app carries tokens
// in headers instead. Web keeps using cookies and never touches this store.
export const isNativeClient = () => Capacitor.isNativePlatform();

const ACCESS_KEY = 'pm.accessToken';
const ID_KEY = 'pm.idToken';
const REFRESH_KEY = 'pm.refreshToken';
const USERNAME_KEY = 'pm.username';
const PREFERENCES_KEY = 'pm.preferences';
const HAS_SESSION_KEY = 'pm.hasSession';

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private-mode / quota failures shouldn't break the auth flow.
  }
};

export const getTokens = () => ({
  accessToken: read(ACCESS_KEY),
  idToken: read(ID_KEY),
  refreshToken: read(REFRESH_KEY),
});

export const setTokens = ({ accessToken, idToken, refreshToken }) => {
  if (accessToken) write(ACCESS_KEY, accessToken);
  if (idToken) write(ID_KEY, idToken);
  if (refreshToken) write(REFRESH_KEY, refreshToken);
};

export const getStoredUsername = () => read(USERNAME_KEY);

export const getStoredPreferences = () => {
  const raw = read(PREFERENCES_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setSessionMeta = ({ username, preferences }) => {
  if (username) write(USERNAME_KEY, username);
  if (preferences) write(PREFERENCES_KEY, JSON.stringify(preferences));
};

// Web sessions live in an httpOnly cookie set by auth-service — invisible to
// JS by design, so there's no way to ask "is there a valid session" directly
// the way getTokens() answers that on native. This flag is the substitute:
// set on every successful login (both platforms), cleared on logout. It lets
// the 401 interceptor tell "a session that existed just died" (show the
// expired-session toast) apart from "this browser/device never logged in"
// (e.g. a first-time visitor's profile fetch 401s on the home screen) —
// the latter must not tell someone their non-existent session "expired."
export const markSessionActive = () => write(HAS_SESSION_KEY, '1');
export const hasActiveSession = () => read(HAS_SESSION_KEY) === '1';

export const clearSession = () => {
  [ACCESS_KEY, ID_KEY, REFRESH_KEY, USERNAME_KEY, PREFERENCES_KEY, HAS_SESSION_KEY].forEach((key) => write(key, null));
};
