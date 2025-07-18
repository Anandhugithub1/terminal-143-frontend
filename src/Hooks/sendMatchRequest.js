// src/hooks/useSendMatchRequest.js
import { useMutation } from '@tanstack/react-query';
import { useSelector, shallowEqual } from 'react-redux';
import axios from 'axios';

export const useSendMatchRequest = () => {
  const { userProfile: currentUser, status: profileStatus } = useSelector(
    (state) => state.user,
    shallowEqual
  );

  const mutation = useMutation({
    mutationFn: async ({ recipient }) => {
      if (!currentUser?.PK || !currentUser?.username) {
        throw new Error('User profile not loaded');
      }

      const senderPK = currentUser.PK;
      const senderUsername = currentUser.username;

      const res = await axios.post('/api/match/request', {
        recipient,
        senderPK,
        senderUsername,
      });

      return res.data;
    },
  });

  return {
    send: (recipient) => {
      if (profileStatus === 'idle' || !currentUser?.PK || !currentUser?.username) {
        console.warn('User profile not ready yet. Aborting match request.');
        return;
      }
      mutation.mutate({ recipient });
    },
    isSending: mutation.isPending,
    error: mutation.error,
    profileLoading: profileStatus === 'idle',
  };
};
