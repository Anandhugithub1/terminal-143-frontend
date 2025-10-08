// src/api/createApiClient.js
import axios from 'axios';
import axiosRetry from 'axios-retry';

export const createApiClient = (baseURL) => {
  const api = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Retry failed requests on network errors or 5xx
  axiosRetry(api, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return !error.response || error.response.status >= 500;
    },
  });

  return api;
};
