import { notificationsApi } from "../../../api/clients"

export async function listNotifications({ limit = 10, lastKey }) {
  const params = { limit }
  if (lastKey) {
    params.lastKey = lastKey
  }

  const res = await notificationsApi.get("/list", {
    params,
    withCredentials: true
  })

  return res.data
}
