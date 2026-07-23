//  src/shared/socket/socketManager.js
// Singleton manager for the chat-service WebSocket connection.
// One physical socket is shared across the whole app; components subscribe
// via useSocket() rather than opening their own connection.
import { fetchConnectTicket } from "./ticketApi";
import { getCurrentUsername } from "../utils/getCurrentUsername";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

const WS_URL = "wss://ws.passormatch.com/chat";
const HEARTBEAT_INTERVAL_MS = 30000;
const MAX_RECONNECT_DELAY_MS = 30000;
const BASE_RECONNECT_DELAY_MS = 1000;
// Backgrounding/tab-switch: close after this long hidden, reconnect on return.
const HIDDEN_CLOSE_DELAY_MS = 2 * 60 * 1000;

export const SocketState = {
  IDLE: "idle",
  CONNECTING: "connecting",
  OPEN: "open",
  CLOSED: "closed",
};

class SocketManager {
  constructor() {
    this.ws = null;
    this.state = SocketState.IDLE;
    this.listeners = new Map(); // messageType -> Set<handler>
    this.stateListeners = new Set();
    this.sendQueue = [];
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.explicitClose = false;
    this.refCount = 0;
    this.connecting = false;

    // True while closed due to backgrounding/tab-switch — distinct from a
    // real release()/closeSession() close, so visibility returning knows to
    // reconnect even though refCount was never touched.
    this.suspended = false;
    this.hiddenTimer = null;

    this._attachLifecycleListeners();
  }

  acquire() {
    this.refCount += 1;
    if (this.state === SocketState.IDLE || this.state === SocketState.CLOSED) {
      this.explicitClose = false;
      this.connect();
    }
  }

  release() {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0) {
      this.explicitClose = true;
      this._teardown();
      this._setState(SocketState.IDLE);
    }
  }

  async connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.connecting) return;
    this.connecting = true;

    this._setState(SocketState.CONNECTING);

    // Tickets are single-use and expire in ~60s — fetch a fresh one for
    // every connection attempt, including reconnects. The auth cookie
    // rides along on this request; the ticket itself goes on the WS URL
    // since the upgrade request can't carry the cookie cross-site.
    let ticket;
    try {
      ticket = await fetchConnectTicket();
    } catch {
      this.connecting = false;
      this._setState(SocketState.CLOSED);
      if (!this.explicitClose) this._scheduleReconnect();
      return;
    }

    // Another acquire()/disconnect() may have raced us while awaiting the ticket.
    if (this.explicitClose || this.refCount === 0) {
      this.connecting = false;
      return;
    }

    this.ws = new WebSocket(`${WS_URL}?ticket=${encodeURIComponent(ticket)}`);

    this.ws.onopen = () => {
      this.connecting = false;
      this.reconnectAttempts = 0;
      this._setState(SocketState.OPEN);
      this._startHeartbeat();
      this._flushQueue();
    };

    this.ws.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      this._dispatch(payload);
    };

    this.ws.onclose = () => {
      this.connecting = false;
      this._stopHeartbeat();
      this._setState(SocketState.CLOSED);
      if (!this.explicitClose) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose fires right after; reconnect handled there.
    };
  }

  disconnect() {
    this.explicitClose = true;
    this._teardown();
    this._setState(SocketState.IDLE);
  }

  // Hard close for logout / token expiry — unlike disconnect(), this ignores
  // refCount entirely (components may still hold the socket "acquired", but
  // the session is over) and stays closed until a fresh acquire() call.
  closeSession() {
    this.refCount = 0;
    this._clearHiddenTimer();
    this.suspended = false;
    this.explicitClose = true;
    this._teardown();
    this._setState(SocketState.IDLE);
  }

  // Backgrounding/tab-switch close: tears the socket down but — unlike
  // disconnect() — leaves refCount untouched and remembers to reconnect
  // once the tab is visible again, without needing a new acquire() call.
  _suspend() {
    if (!this.ws || this.refCount === 0) return;
    this.suspended = true;
    this.explicitClose = true;
    this._teardown();
    this._setState(SocketState.CLOSED);
  }

  _resume() {
    this._clearHiddenTimer();
    this.suspended = false;
    if (this.refCount === 0) return;
    this.explicitClose = false;
    // Don't trust this.state here: on Android the OS can freeze/kill the
    // underlying socket while backgrounded without ever running _suspend()
    // or firing onclose (WebView visibility/timer behavior isn't guaranteed
    // the way it is in a real browser tab) — the client can be left thinking
    // it's still OPEN when nothing is actually being delivered. Foregrounding
    // always re-checks the real readyState instead of trusting local state.
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.reconnectAttempts = 0;
    this.connect();
  }

  _clearHiddenTimer() {
    if (this.hiddenTimer) {
      clearTimeout(this.hiddenTimer);
      this.hiddenTimer = null;
    }
  }

  _attachLifecycleListeners() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this._clearHiddenTimer();
          this.hiddenTimer = setTimeout(() => this._suspend(), HIDDEN_CLOSE_DELAY_MS);
        } else {
          this._resume();
        }
      });

      // Best-effort — browsers don't guarantee this fires in time to complete
      // an async send, but it costs nothing to try. Server-side cleanup for
      // the case it doesn't land is handled independently (connection TTL).
      window.addEventListener("pagehide", () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
      });
    }

    // Android's WebView doesn't fire visibilitychange/pagehide reliably when
    // the Activity is backgrounded (varies by OEM/WebView version), so the
    // DOM listeners above are not enough on native — the socket can die
    // silently in the background with nothing telling it to reconnect once
    // the app returns to foreground. @capacitor/app's appStateChange fires
    // from the real Android lifecycle instead of the WebView's own signals.
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          this._resume();
        } else {
          this._clearHiddenTimer();
          this.hiddenTimer = setTimeout(() => this._suspend(), HIDDEN_CLOSE_DELAY_MS);
        }
      });
    }
  }

  send(payload) {
    const data = JSON.stringify(payload);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      // clientMessageId (present on sendMessage frames — see sendWithAck)
      // rides along so a queued-but-never-flushed entry can be reported back
      // as failed by id rather than just vanishing — see _teardown().
      this.sendQueue.push({ data, clientMessageId: payload?.clientMessageId ?? null });
      // Safety net: an acquire()/release() race (e.g. a component remounting
      // right as it mounts) can leave the manager sitting idle/closed with
      // refCount > 0 and nothing ever having called connect() for it — a
      // queued message would then wait out ACK_TIMEOUT_MS and fail for no
      // visible reason. If nobody is already connecting/open, kick a
      // connection attempt off ourselves rather than trusting one already
      // happened.
      if (this.refCount > 0 && this.state !== SocketState.CONNECTING && this.state !== SocketState.OPEN) {
        this.connect();
      }
    }
  }

  // Like send(), but stamps a client-generated id onto the payload so the
  // caller can correlate chat-service's SENT_ACK response (or a synthetic
  // "SEND_FAILED" dispatched locally if the payload never made it out — see
  // _teardown()) back to this specific call. Returns the id.
  sendWithAck(payload) {
    const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.send({ ...payload, clientMessageId });
    return clientMessageId;
  }

  // handler receives the parsed message payload from the server.
  // Subscribe to a specific `action`/`type` value, or "*" for everything.
  on(messageType, handler) {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }
    this.listeners.get(messageType).add(handler);
    return () => this.listeners.get(messageType)?.delete(handler);
  }

  onStateChange(handler) {
    this.stateListeners.add(handler);
    return () => this.stateListeners.delete(handler);
  }

  _dispatch(payload) {
    const type = payload?.type || payload?.action || "*";
    this.listeners.get(type)?.forEach((handler) => handler(payload));
    this.listeners.get("*")?.forEach((handler) => handler(payload));
  }

  _setState(state) {
    this.state = state;
    this.stateListeners.forEach((handler) => handler(state));
  }

  _flushQueue() {
    while (this.sendQueue.length && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(this.sendQueue.shift().data);
    }
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    // userId rides along so chat-service can re-broadcast presence on every
    // heartbeat — see presenceService.js on the backend.
    this.heartbeatTimer = setInterval(() => {
      this.send({ action: "heartbeat", userId: getCurrentUsername() });
    }, HEARTBEAT_INTERVAL_MS);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimer || this.refCount === 0) return;
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempts,
      MAX_RECONNECT_DELAY_MS
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  _teardown() {
    this._stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
    // Anything still queued here never reached the server — previously this
    // just silently dropped it, so a message typed right before a logout/
    // backgrounding/explicit-release event would show as "sent" in the UI
    // forever with nothing behind it. Tell whoever's listening it failed,
    // by id, instead — see sendWithAck() and ChatConversationPage's
    // SEND_FAILED handler.
    const dropped = this.sendQueue;
    this.sendQueue = [];
    dropped.forEach(({ clientMessageId }) => {
      if (clientMessageId) this._dispatch({ type: 'SEND_FAILED', clientMessageId });
    });
  }
}

export const socketManager = new SocketManager();
