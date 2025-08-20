/* eslint-disable no-unused-vars */
// src/hooks/useMatchRequests.js
import axios from 'axios';
import { useMutation, useQueryClient ,   useQuery  } from '@tanstack/react-query';
const PROFILE_BASE = 'https://userapi.terminal143.com/match/match/requests';

export function useMatchRequests() {
    return useQuery({
      queryKey: ['matchRequests'],
      queryFn: async () => {
        const res = await axios.get(PROFILE_BASE, { withCredentials: true });
        return res.data.requests || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  const REQUEST_ACTION_URL =
  'https://userapi.terminal143.com/match/match/request/respond';

  export function useMatchRequestResponse() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ senderUsername, action }) => {
        return axios.post(
          REQUEST_ACTION_URL,
          { senderUsername, action }, // ✅ removed recipient
          { withCredentials: true }
        );
      },
      onSuccess: (_data, variables) => {
        queryClient.setQueryData(['matchRequests'], (old = []) =>
          old.filter(
            (r) => r.request.senderUsername !== variables.senderUsername // ✅ filter by senderUsername
          )
        );
      },
      onError: (error) => {
        console.error('Action failed', error);
        alert(`Could not perform action. Please try again.`);
      },
    });
  }
  