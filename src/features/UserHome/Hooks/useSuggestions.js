import { useEffect, useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSuggestions } from "../../Profiles/profilesapi"
import { useRef } from "react"
// Helper function to fetch with retry logic
const fetchWithRetry = async (fetchFn, maxRetries = 3, baseDelay = 1000) => {
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn()
    } catch (err) {
      lastError = err
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 1s, 6s
        const delay = attempt < 2 ? baseDelay : 6000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

export function useSuggestions() {
  const queryClient = useQueryClient()
  const [idx, setIdx] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [suggestionError, setSuggestionError] = useState("")
  const [prefetchError, setPrefetchError] = useState("")
  const [currentSource, setCurrentSource] = useState(null)

  /* ---------------- NORMAL FETCH ---------------- */

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ["profiles"],
    queryFn: () =>
      getSuggestions({
        limit: 10,
        refreshRequested: false
      }),
    staleTime: 1000 * 30,
    retry: 3,
    retryDelay: (attemptIndex) =>
      attemptIndex < 2 ? 1000 : 6000,
    refetchOnWindowFocus: false,
    onError: (err) => {
      setSuggestionError(
        err?.response?.status === 500
          ? "Unexpected error occurred. Please try again."
          : err?.message || "Something went wrong"
      )
    }
  })

  /* ---------------- MANUAL REFRESH ---------------- */

const refreshMutation = useMutation({
  mutationFn: () =>
    getSuggestions({
      limit: 10,
      refreshRequested: true
    }),
  onSuccess: (res) => {
    queryClient.setQueryData(["profiles"], res)

    setIdx(0)
    setHasMore(true)
    setSuggestionError("")
    setPrefetching(false)
  }
})

  const handleRefresh = useCallback(() => {
    refreshMutation.mutate()
  }, [refreshMutation])

  /* ---------------- RESPONSE STATE ---------------- */

  const profiles = data?.profiles || []
  const computing = data?.computing || false
  const source = data?.source || null
  const hadPool = data?.hadPool ?? true
  const exhausted = data?.exhausted ?? false
  const canRefresh = data?.canRefresh ?? false
  const nextRefreshInSeconds =
    data?.nextRefreshInSeconds ?? 0

  /* -------- Track source -------- */

  useEffect(() => {
    if (source) setCurrentSource(source)
  }, [source])

  /* -------- Reset when computing -------- */

  useEffect(() => {
    if (computing) {
      setIdx(0)
      setHasMore(true)
      setPrefetching(false)
    }
  }, [computing])





  return {
    profiles,
    idx,
    setIdx,
    hasMore,
    computing,
    hadPool,
    exhausted,
    canRefresh,
    nextRefreshInSeconds,
    suggestionError,
    currentSource,
    handleRefresh,
    isLoading,
    isFetching,
    isRefreshing: refreshMutation.isLoading,
    
    prefetchError,
    refetch
  }
}