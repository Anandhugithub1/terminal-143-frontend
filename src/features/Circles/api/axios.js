import axios
from 'axios';
import { attachAuthInterceptors } from '../../../shared/auth/authInterceptors';

const api =
axios.create({
  baseURL:
    'https://api.passormatch.com',

  withCredentials:
    true,

  headers: {
    'Content-Type':
      'application/json',
  },
});

attachAuthInterceptors(api);

export default api;