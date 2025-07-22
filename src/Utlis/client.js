/*
  src/utils/client.js
  Shared Axios instance for API calls
*/
import axios from 'axios';
export const baseurl ="https://authapi.terminal143.com"
const client = axios.create({
  baseURL: baseurl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;

