import { useEffect, useState, useCallback, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSuggestions } from "../../Profiles/profilesapi"

const AUTO_REFRESH_INTERVAL_MS = 15000
const AUTO_REFRESH_TIMEOUT_MS = 90000

export function useSuggestions({ shouldAutoRefresh = false } = {}) {
  const queryClient = useQueryClient()
  const [idx, setIdx] = useState(0)
  const [suggestionError, setSuggestionError] = useState("")
  const [currentSource, setCurrentSource] = useState(null)
  const [autoRefreshExpired, setAutoRefreshExpired] = useState(false)

  /* ---------------- NORMAL FETCH ---------------- */

  const {
    data,
    isLoading,
    isFetching,
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
      setSuggestionError("")
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

  // Right after profile completion the backend can also just return an
  // empty pool (no explicit computing: true) while it finishes indexing —
  // treat that the same as "computing" for as long as we're still
  // auto-retrying, so callers don't flash a "no matches" state first.
  const isEmptyResult = !exhausted && profiles.length === 0
  const awaitingPostCompletion =
    shouldAutoRefresh && !autoRefreshExpired && isEmptyResult && !suggestionError
  const showComputing = computing || awaitingPostCompletion

  /* -------- Track source -------- */

  useEffect(() => {
    if (source) setCurrentSource(source)
  }, [source])

  /* -------- Reset when computing -------- */

  useEffect(() => {
    if (computing) {
      setIdx(0)
    }
  }, [computing])

  /* -------- Auto-retry while computing (post profile-completion) -------- */

  const refreshMutationRef = useRef(refreshMutation)
  refreshMutationRef.current = refreshMutation

  const showComputingRef = useRef(showComputing)
  showComputingRef.current = showComputing

  useEffect(() => {
    if (!shouldAutoRefresh) return
    setAutoRefreshExpired(false)
  }, [shouldAutoRefresh])

  useEffect(() => {
    if (!shouldAutoRefresh) return

    // Read showComputingRef live inside the tick, rather than depending on
    // showComputing directly, so a mutate() response mid-window doesn't
    // tear down and restart the interval/timeout — it just stops polling
    // once the pool is no longer empty, without resetting the 90s budget.
    const intervalId = window.setInterval(() => {
      if (!showComputingRef.current) return
      refreshMutationRef.current.mutate()
    }, AUTO_REFRESH_INTERVAL_MS)

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId)
      setAutoRefreshExpired(true)
    }, AUTO_REFRESH_TIMEOUT_MS)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [shouldAutoRefresh])

  return {
    profiles,
    idx,
    setIdx,
    computing: showComputing,
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
    refetch
  }
}