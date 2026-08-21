import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
}
from
'@tanstack/react-query';

import { useMemo } from 'react';

import {
  joinCircle,
  leaveCircle,
  requestJoinCircle,
  listCircleRequests,
  getMyCircleRequestStatus,
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
// Invalidates myCircleRequestStatus so the pending indicator picks up
// immediately rather than waiting out its own staleTime.
export function useRequestJoinCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ circleId, message }) => requestJoinCircle(circleId, message),
    onSuccess: (_data, { circleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myCircleRequestStatus(circleId) });
    },
  });
}

// Any member's own request status for a circle — 'none' | 'pending' |
// 'accepted' | 'rejected'. Persists the pending indicator across a
// refresh/navigation, unlike the old local-only React state. staleTime
// mirrors useCircleRequests: a status the requester is actively watching
// for should feel close to live.
export function useMyCircleRequestStatus(circleId) {
  return useQuery({
    queryKey: queryKeys.myCircleRequestStatus(circleId),
    queryFn: async () => {
      const res = await getMyCircleRequestStatus(circleId);
      return res.data;
    },
    enabled: !!circleId,
    staleTime: 1000 * 15,
  });
}

// Owner/moderator only — backend 403s anyone else. Short staleTime since
// this drives an actionable queue a moderator expects to be near-live.
// Paginated, 20 per page (matches the backend's default DynamoDB query
// limit) — fetchNextPage() loads the next page via the backend's opaque
// lastKey cursor, same encode-on-the-way-out shape as chat/matches/
// notifications (see membershipHandler.js's _listRequests).
export function useCircleRequests(circleId) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.circleRequests(circleId),
    queryFn: async ({ pageParam }) => {
      const res = await listCircleRequests(circleId, { lastKey: pageParam });
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastKey,
    enabled: !!circleId,
    staleTime: 1000 * 15,
  });

  const requests = useMemo(
    () => query.data?.pages?.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  return { ...query, requests };
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
