/*
  src/utils/client.js
  Shared Axios instance for API calls
*/
import axios from 'axios';
import { attachAuthInterceptors } from '../shared/auth/authInterceptors';
export const baseurl ="https://api.passormatch.com/auth"
const client = axios.create({
  baseURL: baseurl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(client);

export default client;

