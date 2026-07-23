/*
  src/utils/client.js
  Shared Axios instance for API calls
*/
import axios from 'axios';
export const baseurl ="https://api.passormatch.com/auth"
const client = axios.create({
  baseURL: baseurl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;

