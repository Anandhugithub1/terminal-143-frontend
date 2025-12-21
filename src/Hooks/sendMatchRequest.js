import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { calculateAge } from "../Utlis/utlis"
import { useMyProfile } from "../features/UserProfile/Hooks/useMyProfile"

export const useSendMatchRequest = () => {
  const {
    data: currentUser,
    isLoading: profileLoading,
    isError: profileError
  } = useMyProfile()

  const mutation = useMutation({
    mutationFn: async ({ recipient }) => {
      if (!currentUser?.PK || !currentUser?.username) {
        throw new Error("User profile not loaded")
      }

      const age = calculateAge(currentUser.dob)

      const payload = {
        recipient,
        senderPK: currentUser.PK,
        senderUsername: currentUser.username,
        senderName: currentUser.name,
        senderPhoto: currentUser.photo || "",
        age
      }

      const PROFILE_BASE =
        "https://userapi.terminal143.com/match/request"

      const res = await axios.post(PROFILE_BASE, payload, {
        withCredentials: true
      })

      return res.data
    },
    onError: (err) => {
      console.error(" [hook] mutation error:", err)
    },
    onSuccess: (data) => {
      console.log(" [hook] onSuccess:", data)
    }
  })

  return {
    send: (recipient) => {
      if (!currentUser?.PK || !currentUser?.username) {
        console.warn(" [hook] Aborting; user profile not ready")
        return
      }
      mutation.mutate({ recipient })
    },
    isSending: mutation.isLoading,
    error: mutation.error,
    profileLoading,
    profileError
  }
}
