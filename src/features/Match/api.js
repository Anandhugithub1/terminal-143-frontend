import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../../api/clients';

async function fetchMatches() {
  const res = await matchesApi.get('/match/list', { withCredentials: true });
  return res.data.matches || [];
}

/**
 * Custom hook for fetching matches
 */
export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
