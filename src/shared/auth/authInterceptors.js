import {
  isNativeClient,
  getTokens,
  setTokens,
  getStoredPreferences,
} from './tokenStore';

export const attachAuthInterceptors = (api) => {
  api.interceptors.request.use((config) => {
    if (!isNativeClient()) return config;

    const { accessToken, idToken, refreshToken } = getTokens();
    if (!accessToken || !idToken) return config;

    config.headers['X-Client-Type'] = 'capacitor';
    config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers['X-Id-Token'] = idToken;
    if (refreshToken) config.headers['X-Refresh-Token'] = refreshToken;

    const preferences = getStoredPreferences();
    if (preferences) config.headers['X-Preferences'] = JSON.stringify(preferences);

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
