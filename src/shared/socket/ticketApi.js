// 📁 src/shared/socket/ticketApi.js
import { chatApi } from "../../api/clients";

// Tickets are short-lived (60s) and single-use — fetch one immediately
// before each connection attempt, never cache or reuse the value.
export async function fetchConnectTicket() {
  const { data } = await chatApi.post(
    "/ticket",
    {},
    { withCredentials: true }
  );
  return data.ticket;
}
