// src/hooks/useSendMatchRequest.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { fetchProfile } from '../features/UserProfile';

export function useSendMatchRequest() {
  const dispatch = useDispatch();

  const { currentUser, status: profileStatus, error: profileError } = useSelector(
    (state) => state.userProfile
  );

  useEffect(() => {
    if (profileStatus === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, profileStatus]);

  const BASE_URL = 'https://userapi.terminal143.com';

  // ✅ Correct useMutation syntax for React Query v4+
  const mutation = useMutation({
    mutationFn: async ({ recipient }) => {
      const response = await axios.post(`${BASE_URL}/match/request`, {
        recipient,
        senderPK: currentUser.PK,
        senderUsername: currentUser.username,
      });
      return response.data;
    },
    onError: (err) => {
      console.error('Match Request Error:', err);
      throw err;
    },
  });

  return {
    ...mutation,
    send: (recipient) => mutation.mutate({ recipient }),
    profileLoading: profileStatus === 'loading' || profileStatus === 'idle',
    profileError,
  };
}
