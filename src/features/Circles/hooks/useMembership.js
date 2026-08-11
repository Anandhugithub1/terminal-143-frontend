import {
  useMutation,
  useQuery,
  useQueryClient
}
from
'@tanstack/react-query';

import {
  joinCircle,
  leaveCircle,
  requestJoinCircle,
  listCircleRequests,
  acceptCircleRequest,
  rejectCircleRequest,
  removeCircleMember,
  setCircleMemberRole
}
from
'../api/membershipApi';

import {
  queryKeys
}
from
'../queries/queryKeys';

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

// Private circles only — joinCircle 403s on those, this is the follow-up
// call the UI makes instead. Does not touch queryKeys.circles: a pending
// request is not membership, so "my circles" must not change yet.
export function useRequestJoinCircle() {
  return useMutation({
    mutationFn: ({ circleId, message }) => requestJoinCircle(circleId, message),
  });
}

// Owner/moderator only — backend 403s anyone else. Short staleTime since
// this drives an actionable queue a moderator expects to be near-live.
export function useCircleRequests(circleId) {
  return useQuery({
    queryKey: queryKeys.circleRequests(circleId),
    queryFn: async () => {
      const res = await listCircleRequests(circleId);
      return res.data;
    },
    enabled: !!circleId,
    staleTime: 1000 * 15,
  });
}

export function useAcceptCircleRequest(circleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => acceptCircleRequest(circleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.circleRequests(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.circle(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.circleStats(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.circleMembers(circleId) });
    },
  });
}

export function useRejectCircleRequest(circleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => rejectCircleRequest(circleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.circleRequests(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.circleStats(circleId) });
    },
  });
}

export function useRemoveCircleMember(circleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => removeCircleMember(circleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.circleMembers(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.circle(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.circleStats(circleId) });
    },
  });
}

// { userId, role } where role is 'moderator' or 'member' — owner-only,
// backend 403s a moderator trying to promote/demote another moderator.
export function useSetCircleMemberRole(circleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => setCircleMemberRole(circleId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.circleMembers(circleId) });
    },
  });
}
