import {
  useMutation
}
from
'@tanstack/react-query';

import {
  joinCircle
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