import { useEffect, useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { getSuggestions } from "../../Profiles/profilesapi"

export function useSuggestions() {
  const [idx, setIdx] = useState(0)
  const [nextBatch, setNextBatch] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [suggestionError, setSuggestionError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentSource, setCurrentSource] = useState(null)

const {
  data,
  isLoading,
  isFetching,
  error,
  refetch
} = useQuery({
  queryKey: ["profiles"],
  queryFn: () => getSuggestions({ limit: 10 }),

  staleTime: 1000 * 30,

  retry: 3,

  retryDelay: (attemptIndex) => {
    if (attemptIndex < 2) return 1000
    return 6000
  },

  refetchOnWindowFocus: false,

  onError: (err) => {
    setSuggestionError(
      err?.response?.status === 500
        ? "Unexpected error occurred. Please try again."
        : err?.message || "Something went wrong"
    )
  }
})



  const profiles = data?.profiles || []
  const computing = data?.computing || false
  const source = data?.source || null
  const hadPool = data?.hadPool ?? true

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

    getSuggestions({ limit: 10 })
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
  }, [idx, profiles.length, nextBatch.length, hasMore])

  /* -------- Refresh -------- */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)

    setIdx(0)
    setNextBatch([])
    setHasMore(true)
    setSuggestionError("")

    await refetch()

    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }, [refetch])

  return {
    profiles,
    idx,
    setIdx,
    nextBatch,
    setNextBatch,
    hasMore,
    computing,
    hadPool,
    suggestionError,
    isRefreshing,
    currentSource,
    handleRefresh,
    isLoading,
    isFetching,
    refetch
  }
}
