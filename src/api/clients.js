// src/api/clients.js
import { createApiClient } from './createApiClient';

const isDev = import.meta.env.VITE_MODE === 'dev';

const userApiBase = isDev ? import.meta.env.VITE_API_USER : 'https://api.passormatch.com/user';
const matchesApiBase = isDev ? import.meta.env.VITE_API_MATCH : 'https://api.passormatch.com/match/v0.2';
const LocationApiBase = 'https://api.passormatch.com/location-service/v0.2'
const authApiBase = isDev ? import.meta.env.VITE_API_AUTH : 'https://api.passormatch.com/auth/v0.2';
const suggestionApiBase = "https://api.passormatch.com/suggestion/v0.2"
const reportApiBase = "https://api.passormatch.com/report"
const reviewApiBase = "https://api.passormatch.com/review"
const chatApiBase = isDev ? import.meta.env.VITE_API_CHAT : 'https://api.passormatch.com/chat'
const notificationsApiBase = isDev ? import.meta.env.VITE_API_NOTIFICATIONS : 'https://api.passormatch.com/notifications'
export const userProfilesApi = createApiClient(userApiBase);
export const matchesApi = createApiClient(matchesApiBase);
export const authApi = createApiClient(authApiBase);
export const locationAPi =createApiClient(LocationApiBase);
export const suggestionApi =createApiClient(suggestionApiBase)
export const reportApi = createApiClient(reportApiBase)
export const reviewApi = createApiClient(reviewApiBase)
export const chatApi = createApiClient(chatApiBase)
export const notificationsApi = createApiClient(notificationsApiBase)