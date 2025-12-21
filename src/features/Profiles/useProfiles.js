import { useInfiniteQuery } from "@tanstack/react-query"
import { getMatchProviders } from "./profilesapi"

export function useProfiles(limit = 10) {
  return useInfiniteQuery({
    queryKey: ["profiles"],
    queryFn: ({ pageParam = 0 }) =>
      getMatchProviders({ limit }),
    getNextPageParam: lastPage =>
      lastPage && lastPage.length ? true : undefined,
    staleTime: 1000 * 30
  })
}
