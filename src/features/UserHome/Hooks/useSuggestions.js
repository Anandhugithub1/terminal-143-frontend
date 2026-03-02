import { useEffect, useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSuggestions } from "../../Profiles/profilesapi"

export function useSuggestions() {
  const queryClient = useQueryClient()
  const [idx, setIdx] = useState(0)
  const [suggestionError, setSuggestionError] = useState("")
  const [currentSource, setCurrentSource] = useState(null)

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

  return {
    profiles,
    idx,
    setIdx,
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