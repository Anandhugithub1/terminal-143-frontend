import {
  isNativeClient,
  getTokens,
  setTokens,
  getStoredPreferences,
} from './tokenStore';

// CapacitorHttp patches XMLHttpRequest, and axios's AxiosHeaders wrapper does
// not always survive that round trip — assigning through .set() when it exists
// keeps this working whether headers arrive as an instance or a plain object.
const setHeader = (config, name, value) => {
  if (typeof config.headers?.set === 'function') config.headers.set(name, value);
  else config.headers[name] = value;
};

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
  api.interceptors.response.use((response) => {
    if (isNativeClient() && response.data?._refreshedTokens) {
      setTokens(response.data._refreshedTokens);
    }
    return response;
  });
};
