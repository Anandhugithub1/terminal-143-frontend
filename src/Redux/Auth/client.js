import axios from 'axios';
import { store } from '../store';
import { logout } from './slice';

const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,  // e.g. http://localhost:2000
  headers: { 'Content-Type': 'application/json' }
});

// Add auth headers and logout on 401
authClient.interceptors.request.use(
  config => {
    const { accessToken, userType } = store.getState().auth;
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    if (userType)   config.headers['x-user-type'] = userType;
    return config;
  },
  error => Promise.reject(error)
);

authClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default authClient;