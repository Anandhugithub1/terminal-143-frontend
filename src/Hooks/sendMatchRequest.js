import { useMutation } from "@tanstack/react-query"
import axios from "axios"

export const useSendMatchRequest = () => {
  const mutation = useMutation({
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
    onSuccess: (data) => {
      console.log("[hook] onSuccess:", data)
    }
  })

  return {
    send: (recipientId, options = {}) => {
      if (!recipientId) {
        console.warn("[hook] Aborting; recipientId missing")
        return
      }
      const { postId, circleId, createdAtEpoch, ...mutationOptions } = options
      mutation.mutate({ recipientId, postId, circleId, createdAtEpoch }, mutationOptions)
    },
    isSending: mutation.isLoading,
    error: mutation.error
  }
}
