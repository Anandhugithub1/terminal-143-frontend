//  src/shared/socket/useSocket.js
import { useEffect, useRef, useState, useCallback } from "react";
import { socketManager, SocketState } from "./socketManager";

// Mounts the shared socket connection for the lifetime of the component.
// Multiple components can use this at once — the underlying WebSocket is
// ref-counted and only actually closes once nobody needs it anymore.
export function useSocket() {
  const [state, setState] = useState(socketManager.state);

  useEffect(() => {
    socketManager.acquire();
    const unsubscribe = socketManager.onStateChange(setState);
    return () => {
      unsubscribe();
      socketManager.release();
    };
  }, []);

  const send = useCallback((payload) => socketManager.send(payload), []);

  return { state, send, isConnected: state === SocketState.OPEN };
}

// Subscribes to one message type (e.g. "newMessage", "readReceipt") for the
// lifetime of the component. Pass "*" to receive every incoming message.
export function useSocketEvent(messageType, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return socketManager.on(messageType, (payload) => handlerRef.current(payload));
  }, [messageType]);
}
