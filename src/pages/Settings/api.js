import { reportApi, reviewApi } from "../../api/clients";
import { useMutation } from "@tanstack/react-query"


export const createSupportCase = async data => {
  try {
    const res = await reportApi.post(
      "/support/case",
      data,
      { withCredentials: true }
    )
    return res.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create support case"
    )
  }
}

export const submitAppReview = async ({ rating, text, isAnonymous }) => {
  try {
    const res = await reviewApi.post(
      "/create",
      { rating, text, isAnonymous },
      { withCredentials: true }
    )
    return res.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to submit review"
    )
  }
}

