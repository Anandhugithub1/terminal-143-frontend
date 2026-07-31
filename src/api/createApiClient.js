// src/api/createApiClient.js
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { attachAuthInterceptors } from '../shared/auth/authInterceptors';

export const createApiClient = (baseURL) => {
  const api = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Retry failed requests on network errors or 5xx
  axiosRetry(api, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return !error.response || error.response.status >= 500;
    },
  });

  attachAuthInterceptors(api);

  return api;
};
