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

export const clearSession = () => {
  [ACCESS_KEY, ID_KEY, REFRESH_KEY, USERNAME_KEY, PREFERENCES_KEY].forEach((key) => write(key, null));
};
