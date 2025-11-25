// src/api/clients.js
import { createApiClient } from './createApiClient';

const isDev = import.meta.env.VITE_MODE === 'dev';

const userApiBase = isDev ? import.meta.env.VITE_API_USER : 'https://userapi.terminal143.com';
const matchesApiBase = isDev ? import.meta.env.VITE_API_MATCH : 'https://userapi.terminal143.com/match';
const LocationApiBase = 'https://authapi.terminal143.com/location'
const authApiBase = isDev ? import.meta.env.VITE_API_AUTH : 'https://authapi.terminal143.com';

export const userProfilesApi = createApiClient(userApiBase);
export const matchesApi = createApiClient(matchesApiBase);
export const authApi = createApiClient(authApiBase);
export const locationAPi =createApiClient(LocationApiBase);