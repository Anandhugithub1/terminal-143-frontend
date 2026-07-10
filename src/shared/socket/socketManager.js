// 📁 src/shared/socket/socketManager.js
// Singleton manager for the chat-service WebSocket connection.
// One physical socket is shared across the whole app; components subscribe
// via useSocket() rather than opening their own connection.
import { fetchConnectTicket } from "./ticketApi";

const WS_URL = "wss://ws.passormatch.com/chat";
const HEARTBEAT_INTERVAL_MS = 30000;
const MAX_RECONNECT_DELAY_MS = 30000;
const BASE_RECONNECT_DELAY_MS = 1000;

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

  send(payload) {
    const data = JSON.stringify(payload);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      this.sendQueue.push(data);
    }
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
      this.ws.send(this.sendQueue.shift());
    }
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ action: "heartbeat" });
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
    this.sendQueue = [];
  }
}

export const socketManager = new SocketManager();
