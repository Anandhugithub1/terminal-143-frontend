/* eslint-disable no-unused-vars */
// src/hooks/useMatchRequests.js
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { matchesApi } from '../../api/clients'; // import your API client

export function useMatchRequests() {
  return useQuery({
    queryKey: ['matchRequests'],
    queryFn: async () => {
      const res = await matchesApi.get('/match/requests', {
        withCredentials: true, 
      });
      return res.data.requests || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMatchRequestResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderUsername, action }) => {
      const res = await matchesApi.post(
        '/match/request/respond',
        { senderUsername, action },
        { withCredentials: true } 
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(['matchRequests'], (old = []) =>
        old.filter(
          (r) => r.request.senderUsername !== variables.senderUsername
        )
      );
    },
    onError: (error) => {
      console.error('Action failed', error);
      alert(`Could not perform action. Please try again.`);
    },
  });
}
