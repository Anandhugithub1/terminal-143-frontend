import { useQuery } from '@tanstack/react-query';
import { getProfileByLink } from '../features/UserProfile/api/profile';

export const useProfileByLink = (link) => {
  return useQuery({
    queryKey: ['profileByLink', link],
    queryFn: () => getProfileByLink(link),
    enabled: !!link, // Only fetch if link is provided
    staleTime: 5 * 60 * 1000, // Optional: cache for 5 minutes
  });
};
