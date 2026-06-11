import api from './axios';

export const getPresignedUrl =
payload =>
  api.post(
    'circles/predesignedurl',
    payload
  );