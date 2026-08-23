import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { getErrorMessage } from "../shared/api/getErrorMessage"

export const useSendMatchRequest = () => {
  const mutation = useMutation({
    // client.js's global MutationCache already toasts getErrorMessage(error)
    // for any mutation that doesn't opt out — silent here so this hook's own
    // onError below (which needs the same translated, status-aware message
    // to disable/reset the caller's pending UI) doesn't double it up.
    meta: { silent: true },
    mutationFn: async ({ recipientId, postId, circleId, createdAtEpoch }) => {
      const body = { recipientId }
      if (postId && circleId && createdAtEpoch) {
        body.postId = postId
        body.circleId = circleId
        body.createdAtEpoch = createdAtEpoch
        body.field = "match"
      }
      const res = await axios.post(
        "https://api.passormatch.com/match/v0.2/request",
        body,
        { withCredentials: true }
      )
      return res.data
    },
    onError: (err) => {
      console.error("[hook] mutation error:", err)
    },
  })

  return {
    // Tapping Match/swiping right has no visible state change of its own
    // (unlike a like button that fills in), so a failed request that only
    // logs to console is indistinguishable from a successful one — the
    // button just does nothing. This default toast fires whenever a caller
    // doesn't supply its own onError, so every entry point (circles feed,
    // profile, swipe deck) gets baseline feedback instead of silently
    // eating network/auth failures.
    send: (recipientId, options = {}) => {
      if (!recipientId) {
        console.warn("[hook] Aborting; recipientId missing")
        return
      }
      const { postId, circleId, createdAtEpoch, onError, ...mutationOptions } = options
      mutation.mutate(
        { recipientId, postId, circleId, createdAtEpoch },
        {
          onError: onError || ((err) => toast.error(getErrorMessage(err))),
          ...mutationOptions,
        }
      )
    },
    isSending: mutation.isLoading,
    error: mutation.error
  }
}
