// features/AgeVerification/useAgeVerification.js
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getAgeStatus } from "./api"

// Fetches the server-authoritative age-verification state. Drives whether the
// app shows nothing ('ok'), the dismissible reminder ('grace'), or the
// blocking gate ('expired'). Fails open: a failed status lookup is treated as
// 'ok' so a transient error never locks a user out of the app.
export const useAgeVerification = () => {
  const query = useQuery({
    queryKey: ["age-verification-status"],
    queryFn: getAgeStatus,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const data = query.data
  return {
    ...query,
    // Normalised, safe defaults for consumers.
    enabled: !!data?.enabled,
    required: !!data?.required,
    status: data?.status || "not_required",
    // Treat missing/errored state as 'ok' (fail open).
    state: data?.state || "ok",
    daysRemaining: data?.daysRemaining ?? null,
  }
}

// Call after a verification attempt so the banner/gate re-reads fresh state.
export const useRefreshAgeVerification = () => {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ["age-verification-status"] })
}
