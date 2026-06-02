import api
from '@/api/axios';

const BASE =
'https://api.passormatch.com/circles';

export const createCircle =
payload =>
  api.post(
    BASE,
    payload
  );

export const listUserCircles =
() =>
  api.get(
    BASE
  );

export const getCircle =
circleId =>
  api.get(
    `${BASE}/${circleId}`
  );

export const updateCircle =
(
  circleId,
  payload
) =>
  api.patch(
    `${BASE}/${circleId}`,
    payload
  );