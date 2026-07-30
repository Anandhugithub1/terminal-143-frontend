import api from './axios'

const BASE =
'https://api.passormatch.com/circles';

export const joinCircle =
circleId =>
  api.post(
    `${BASE}/${circleId}/join`
  );

export const leaveCircle =
circleId =>
  api.post(
    `${BASE}/${circleId}/leave`
  );