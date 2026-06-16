import { useMutation } from "@tanstack/react-query"
import axios from "axios"

export const useSendMatchRequest = () => {
  const mutation = useMutation({
    mutationFn: async ({ recipientId }) => {
      const res = await axios.post(
        "https://api.passormatch.com/match/v0.2/request",
        { recipientId },
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

      mutation.mutate({ recipientId }, options)
    },
    isSending: mutation.isLoading,
    error: mutation.error
  }
}
