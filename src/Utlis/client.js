/*
  src/utils/client.js
  Shared Axios instance for API calls
*/
import axios from 'axios';
import { baseurl } from './utlis';

const client = axios.create({
  baseURL: baseurl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;

