import { reportApi, reviewApi } from "../../api/clients";
import { useMutation } from "@tanstack/react-query"
import { getErrorMessage } from "../../shared/api/getErrorMessage"


export const createSupportCase = async data => {
  try {
    const res = await reportApi.post(
      "/support/case",
      data,
      { withCredentials: true }
    )
    return res.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
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
    throw new Error(getErrorMessage(error))
  }
}

