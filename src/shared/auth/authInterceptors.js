import { toast } from 'sonner';
import i18n from '../../i18n/i18n';
import {
  isNativeClient,
  getTokens,
  setTokens,
  getStoredPreferences,
} from './tokenStore';
import { performLogout } from './logout';

// CapacitorHttp patches XMLHttpRequest, and axios's AxiosHeaders wrapper does
// not always survive that round trip — assigning through .set() when it exists
// keeps this working whether headers arrive as an instance or a plain object.
const setHeader = (config, name, value) => {
  if (typeof config.headers?.set === 'function') config.headers.set(name, value);
  else config.headers[name] = value;
};

// These auth-service endpoints legitimately return 401 for reasons that have
// nothing to do with an existing session going bad (wrong password, expired
// OTP, etc.) — a 401 here must show as a form error, not trigger a forced
// logout + redirect to /login while the user is mid-login.
const PUBLIC_AUTH_PATHS = [
  '/login',
  '/register',
  '/confirm',
  '/resend-otp',
  '/forgot-password',
  '/confirm-forgot-password',
];

const isPublicAuthRequest = (config) => {
  const url = config?.url || '';
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
};

// Several requests can be in flight when a token dies (e.g. a chat heartbeat
// poll firing alongside whatever the user is actively doing) and would each
// resolve to a 401 within the same instant — without this guard every one of
// them would independently call performLogout(), which is harmless but noisy
// (multiple sign-out network calls, multiple navigations). Module-level is
// intentional: this must be shared across every api client's interceptor,
// not per-client state.
let loggingOut = false;

export const attachAuthInterceptors = (api) => {
  api.interceptors.request.use((config) => {
    if (!isNativeClient()) return config;

    config.headers = config.headers || {};

    const { accessToken, idToken, refreshToken } = getTokens();
    if (!accessToken || !idToken) return config;

    setHeader(config, 'X-Client-Type', 'capacitor');
    setHeader(config, 'Authorization', `Bearer ${accessToken}`);
    setHeader(config, 'X-Id-Token', idToken);
    if (refreshToken) setHeader(config, 'X-Refresh-Token', refreshToken);

    const preferences = getStoredPreferences();
    if (preferences) setHeader(config, 'X-Preferences', JSON.stringify(preferences));

    return config;
  });

  // Services rotate expired tokens mid-request and hand the new pair back in the
  // body (native can't receive them as Set-Cookie), so persist them here or the
  // app keeps sending the expired one and re-refreshes on every call.
  api.interceptors.response.use(
    (response) => {
      if (isNativeClient() && response.data?._refreshedTokens) {
        setTokens(response.data._refreshedTokens);
      }
      return response;
    },
    (error) => {
      const status = error?.response?.status;
      if (status === 401 && !isPublicAuthRequest(error.config || {}) && !loggingOut) {
        // Every backend service normalizes an expired/invalid/missing token
        // to 401 (403 is reserved for real permission failures), so this is
        // a reliable "the session is dead" signal for any authenticated
        // request. Fire-and-forget: the caller's own .catch still runs with
        // the original rejection, this just also tears down the session.
        loggingOut = true;
        toast.error(i18n.t('errors:unauthorized'));
        performLogout().finally(() => {
          loggingOut = false;
        });
      }
      return Promise.reject(error);
    }
  );
};
