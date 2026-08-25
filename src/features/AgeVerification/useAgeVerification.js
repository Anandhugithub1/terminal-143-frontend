// features/AgeVerification/useAgeVerification.js
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getAgeStatus } from "./api"

// Fetches the server-authoritative age-verification state. Drives whether the
// app shows nothing ('ok'), the dismissible reminder ('grace'), or the
// blocking gate ('expired'). Fails open: a failed status lookup is treated as
// 'ok' so a transient error never locks a user out of the app.
//
// `enabled` param: pass false to skip the fetch entirely (e.g. AgeGate does
// this until the user is logged in with a completed profile) — there's no
// reason to hit an authenticated endpoint before that's true, and doing so
// on the login screen would otherwise fire a call that's guaranteed to 401.
export const useAgeVerification = (enabled = true) => {
  const query = useQuery({
    queryKey: ["age-verification-status"],
    queryFn: getAgeStatus,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled,
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
// Also invalidate the profile query so the "Age Verified" badge appears
// immediately on the profile page — it reads `ageVerified` from ["my-profile"],
// which is cached (staleTime) and would otherwise only update on a later
// refetch, making the badge lag behind the verified state by minutes.
export const useRefreshAgeVerification = () => {
  const qc = useQueryClient()
  // `verified` (default true, set on a passed result) optimistically flips the
  // cached raw profile to a passed age-verification status so the badge paints
  // the instant the flow closes, before the network refetch lands. The
  // invalidation right after re-confirms it from the server.
  return (verified = true) => {
    if (verified) {
      // mapProfile derives `ageVerified` from raw `ageVerification.status`, so
      // patch the raw shape the queryFn returns (select runs over this).
      qc.setQueryData(["my-profile"], (prev) =>
        prev
          ? { ...prev, ageVerified: true, ageVerification: { ...(prev.ageVerification || {}), status: "passed" } }
          : prev
      )
    }
    qc.invalidateQueries({ queryKey: ["age-verification-status"] })
    qc.invalidateQueries({ queryKey: ["my-profile"] })
  }
}
