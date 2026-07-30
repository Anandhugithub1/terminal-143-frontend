import {
  useMutation
}
from
'@tanstack/react-query';

import {
  joinCircle,
  leaveCircle
}
from
'../api/membershipApi';

export function
useJoinCircle() {
  return useMutation({
    mutationFn:
      circleId =>
        joinCircle(
          circleId
        )
  });
}

export function
useLeaveCircle() {
  return useMutation({
    mutationFn:
      circleId =>
        leaveCircle(
          circleId
        )
  });
}
