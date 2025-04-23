// ==== src/redux/apiClient.js ====
import axios from 'axios';
import { store } from './store';
import { logout } from './Slices/authSlice';


const apibaseurl =import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: apibaseurl,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use(
  config => {
    const { auth } = store.getState();
    if (auth.accessToken) config.headers.Authorization = `Bearer ${auth.accessToken}`;
    if (auth.userType) config.headers['x-user-type'] = auth.userType;
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default apiClient;