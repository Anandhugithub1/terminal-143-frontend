// src/shared/auth/logout.js
// Centralized logout orchestration, extracted from the inline mutation that
// used to live in Settings.jsx so non-component callers (e.g. the axios
// response interceptor in authInterceptors.js reacting to a 401) can trigger
// the exact same full logout sequence.
import { signOut } from '../../features/Auth/authApi';
import { socketManager } from '../socket/socketManager';
import { clearSession } from './tokenStore';
import { queryClient } from '../lib/client';
import { CapacitorCookies } from '@capacitor/core';
import { router } from '../../main.jsx';

// Order mirrors the original Settings.jsx logoutMutation:
//   1. signOut() network call (best-effort — see below)
//   2. close the socket session
//   3. clear localStorage / sessionStorage
//   4. clear the native cookie jar (best-effort)
//   5. clear the token store (access/id/refresh tokens + session meta)
//   6. clear the React Query cache
//   7. navigate to /login
//
// Unlike the original, step 1's failure no longer blocks steps 2-7: signOut()
// already clears the token store internally on both success and failure (see
// authApi.js), but a network error there used to reject the mutation before
// onSuccess ran, leaving the socket open and local storage/cache intact. A
// user whose token is already invalid (the exact case the interceptor exists
// for) must still end up logged out client-side, so the local cleanup here
// always runs regardless of signOut()'s outcome.
export const performLogout = async () => {
  try {
    await signOut('signout');
  } catch (err) {
    console.warn('signOut() failed during logout; continuing with local cleanup', err);
  }

  socketManager.closeSession();

  localStorage.clear();
  sessionStorage.clear();

  // The auth cookie is HttpOnly, so JS can't touch it via document.cookie —
  // this clears it at the native WebView cookie-jar level as a safety net
  // in case the server's Set-Cookie expiry doesn't land (e.g. flaky
  // cross-subdomain cookie handling between app.* and api.* in the WebView).
  try {
    await CapacitorCookies.clearAllCookies();
  } catch (err) {
    console.warn('Failed to clear cookies on logout', err);
  }

  // signOut() already calls clearSession() on both its success and failure
  // paths, but that call is skipped entirely if signOut() throws before
  // reaching it (e.g. the request never leaves the device). Calling it again
  // here is a cheap no-op in the common case and a real safety net otherwise.
  clearSession();

  // Without this, the next account to log in on this device inherits this
  // session's cached queries (e.g. useMyProfile's ["my-profile"] key carries
  // no user id) until they individually go stale.
  queryClient.clear();

  // router.navigate keeps this an in-SPA transition (matches the existing
  // router.navigate(url) usage for push-notification taps in main.jsx)
  // rather than a full page reload via window.location.href.
  router.navigate('/login');
};
