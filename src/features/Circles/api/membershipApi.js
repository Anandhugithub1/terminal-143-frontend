import api
from '@/api/axios';

const BASE =
'https://api.passormatch.com/circles';

export const joinCircle =
circleId =>
  api.post(
    `${BASE}/${circleId}/join`
  );