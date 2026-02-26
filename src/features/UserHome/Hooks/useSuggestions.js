import { useEffect, useState, useCallback } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { getSuggestions } from "../../Profiles/profilesapi"

export function useSuggestions() {
  const [idx, setIdx] = useState(0)
  const [nextBatch, setNextBatch] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [suggestionError, setSuggestionError] = useState("")
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
    onSuccess: () => {
      setIdx(0)
      setNextBatch([])
      setHasMore(true)
      setSuggestionError("")
      refetch()
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
      setNextBatch([])
      setHasMore(true)
    }
  }, [computing])

  /* -------- Prefetch logic -------- */

  useEffect(() => {
    if (!hasMore) return
    if (profiles.length === 0) return
    if (profiles.length - idx > 2) return
    if (nextBatch.length > 0) return
    if (exhausted) return

    getSuggestions({
      limit: 10,
      refreshRequested: false
    })
      .then((res) => {
        const nextProfiles = res?.profiles || []
        if (nextProfiles.length === 0) {
          setHasMore(false)
          return
        }
        setNextBatch(nextProfiles)
      })
      .catch(() => {
        setSuggestionError("Failed to load more profiles.")
        setHasMore(false)
      })
  }, [
    idx,
    profiles.length,
    nextBatch.length,
    hasMore,
    exhausted
  ])

  return {
    profiles,
    idx,
    setIdx,
    nextBatch,
    setNextBatch,
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
    refetch
  }
}