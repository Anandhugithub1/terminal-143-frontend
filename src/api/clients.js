// src/api/clients.js
import { createApiClient } from './createApiClient';

export const userProfilesApi = createApiClient('https://userapi.terminal143.com');
export const matchesApi = createApiClient('https://userapi.terminal143.com/match');
export const authApi = createApiClient('https://authapi.terminal143.com');
