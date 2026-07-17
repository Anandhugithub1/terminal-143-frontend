//  src/shared/socket/ticketApi.js
import { chatApi } from "../../api/clients";

// Tickets are short-lived (60s) and single-use — fetch one immediately
// before each connection attempt, never cache or reuse the value.
export async function fetchConnectTicket() {
  // chatApi's baseURL already ends in /chat, so the path must NOT repeat it
  // (the other chat calls use /conversations, /block, etc. the same way).
  const { data } = await chatApi.post(
    "/ticket",
    {},
    { withCredentials: true }
  );
  return data.ticket;
}
