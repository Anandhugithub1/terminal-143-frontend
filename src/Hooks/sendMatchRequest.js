// src/hooks/useSendMatchRequest.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { fetchProfile } from '../features/UserProfile';

export function useSendMatchRequest() {
  const dispatch = useDispatch();

  // 1) Pull in profile slice state
  const { currentUser, status: profileStatus, error: profileError } = useSelector(
    state => state.userProfile
  );

  // 2) If we've never fetched the profile, do it here
  useEffect(() => {
    if (profileStatus === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, profileStatus]);


  const BASE_URL = 'https://userapi.terminal143.com';

  // 3) Prepare the mutation
  const mutation = useMutation(
    ({ recipient }) =>
      axios.post(`${BASE_URL}/match/request`, {
        recipient,
        senderPK: currentUser.PK,
        senderUsername: currentUser.username,
      }),
    {
      onError: err => {
        console.error('Match Request Error:', err);
        throw err;
      },
    }
  );

  return {
    ...mutation,
    // expose a single 'send' helper so components stay super clean:
    send: recipient => mutation.mutate({ recipient }),
    // also expose profile loading state so UIs can block until ready:
    profileLoading: profileStatus === 'loading' || profileStatus === 'idle',
    profileError,
  };
}
