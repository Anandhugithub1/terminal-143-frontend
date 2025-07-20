// src/hooks/useMatches.js
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const MATCHES_API = 'https://userapi.terminal143.com/match/list';

async function fetchMatches() {
  const res = await axios.get(MATCHES_API, { withCredentials: true });
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
