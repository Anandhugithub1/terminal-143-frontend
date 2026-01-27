import { useInfiniteQuery } from "@tanstack/react-query"
import { listNotifications } from "../api/api"

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      listNotifications({
        lastKey: pageParam
      }),
    getNextPageParam: lastPage =>
      lastPage.lastKey || undefined
  })
}
