/* eslint-disable no-unused-vars */
// src/hooks/useMatchRequests.js
import axios from 'axios';
import { useMutation, useQueryClient ,   useQuery  } from '@tanstack/react-query';
const PROFILE_BASE = 'https://userapi.terminal143.com/match/requests';
import { useNavigate } from 'react-router-dom'; 


export function useMatchRequests() {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['matchRequests'],
    queryFn: async () => {
      try {
        const res = await axios.get(PROFILE_BASE, { withCredentials: true });
        return res.data.requests || [];
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}



const REQUEST_ACTION_URL = 'https://userapi.terminal143.com/match/request/respond';

export function useMatchRequestResponse() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ senderUsername, action, senderPK, senderSK, recipientPK, recipientSK }) => {
        return axios.post(
          REQUEST_ACTION_URL,
          { senderUsername, action, senderPK, senderSK, recipientPK, recipientSK },
          { withCredentials: true }
        );
      },
      onSuccess: (_data, variables) => {
        queryClient.setQueryData(['matchRequests'], (old = []) =>
          old.filter((r) => r.request.senderUsername !== variables.senderUsername)
        );
      },
      onError: (error, _variables, _context) => {
        console.error('Action failed', error);
        alert(`Could not perform action. Please try again.`);
      },
    });
  }