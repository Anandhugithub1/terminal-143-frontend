import api from './axios';

export const getPresignedUrl =
payload =>
  api.post(
    '/presigned-url',
    payload
  );