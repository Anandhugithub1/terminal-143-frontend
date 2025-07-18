// src/hooks/useSendMatchRequest.js
import { useMutation } from '@tanstack/react-query';
import { useSelector, shallowEqual } from 'react-redux';
import axios from 'axios';

export const useSendMatchRequest = () => {
  const userState = useSelector(state => state.user, shallowEqual) || {};
  const currentUser = userState.userProfile;
  const profileStatus = userState.status || 'idle';

  const mutation = useMutation({
    mutationFn: async ({ recipient }) => {
      console.log('🔥 [hook] mutationFn called with:', recipient);
      if (!currentUser?.PK || !currentUser?.username) {
        console.error('❌ [hook] currentUser missing:', currentUser);
        throw new Error('User profile not loaded');
      }
      const payload = {
        recipient,
        senderPK: currentUser.PK,
        senderUsername: currentUser.username,
      };
      console.log('📡 [hook] POST /api/match/request payload:', payload);
      const res = await axios.post('/api/match/request', payload);
      console.log('✅ [hook] mutationFn success:', res.data);
      return res.data;
    },
    onError: err => console.error('❌ [hook] mutation error:', err),
    onSuccess: data => console.log('✅ [hook] onSuccess:', data),
  });

  return {
    send: recipient => {
      console.log('→ [hook] send() called for:', recipient);
      if (profileStatus === 'idle' || !currentUser?.PK) {
        console.warn('⚠️ [hook] Aborting; profileStatus or currentUser missing');
        return;
      }
      mutation.mutate({ recipient });
    },
    isSending: mutation.isPending,
    error: mutation.error,
    profileLoading: profileStatus === 'idle',
  };
};
