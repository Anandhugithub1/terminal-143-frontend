// src/hooks/useMatchRequests.js
import axios from 'axios';
import { useMutation, useQueryClient ,   useQuery  } from '@tanstack/react-query';
const PROFILE_BASE = 'https://userapi.terminal143.com/match/requests';

export function useMatchRequests() {
  return useQuery(
    ['matchRequests'],
    async () => {
      const res = await axios.get(PROFILE_BASE, { withCredentials: true });
      return res.data.requests || [];
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}




const REQUEST_ACTION_URL = 'https://userapi.terminal143.com/match/request/respond';

export function useMatchRequestResponse() {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ senderUsername, action, senderPK, senderSK, recipientPK, recipientSK }) => {
      return axios.post(
        REQUEST_ACTION_URL,
        { senderUsername, action, senderPK, senderSK, recipientPK, recipientSK },
        { withCredentials: true }
      );
    },
    {
      onSuccess: (_, variables) => {
        queryClient.setQueryData(['matchRequests'], old =>
          old.filter(r => r.request.senderUsername !== variables.senderUsername)
        );
      },
      onError: (err) => {
        console.error('Action failed', err);
        alert(`Could not ${err.config.data.action} request. Please try again.`);
      }
    }
  );
}