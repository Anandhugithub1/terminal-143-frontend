// features/AgeVerification/api.js
// Client for the deferred, region-gated age-verification endpoints in
// user-service. See the backend age-verification services for the contract.
import { userProfilesApi } from "../../api/clients"

/**
 * Server-authoritative verification state. The client NEVER computes eligibility
 * or the deadline itself — it always reads them from here.
 * -> { enabled, required, status, state: 'ok'|'grace'|'expired', daysRemaining, deadline }
 */
export const getAgeStatus = async () => {
  const res = await userProfilesApi.get("/v0.2/user/age/status", { withCredentials: true })
  return res.data
}

/** Start a Rekognition Face Liveness session. -> { sessionId } */
export const startAgeSession = async () => {
  const res = await userProfilesApi.post(
    "/v0.2/user/age/liveness/session",
    {},
    { withCredentials: true }
  )
  return res.data
}

/**
 * Submit a completed liveness session for evaluation.
 * -> { status: 'passed'|'failed'|'challenge', reason }
 */
export const getAgeResult = async (sessionId) => {
  const res = await userProfilesApi.post(
    "/v0.2/user/age/liveness/result",
    { sessionId },
    { withCredentials: true }
  )
  return res.data
}
