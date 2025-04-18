// src/useWebSocket.js
import { useRef, useState, useEffect } from 'react';

/**
 * useWebSocket
 * A custom React hook that uses the browser's native WebSocket API—no extra packages required.
 * @param {string} url - The ws:// or wss:// endpoint including query params for authentication
 * @returns {{ ws: WebSocket | null, connected: boolean }}
 */
export function useWebSocket(url) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize native WebSocket
    const ws = new WebSocket(url);
    wsRef.current = ws;

    // Connection opened
    ws.onopen = () => setConnected(true);
    // Connection closed
    ws.onclose = () => setConnected(false);
    // Log any errors
    ws.onerror = (err) => console.error('WebSocket error:', err);
    // Optional: handle inbound messages
    ws.onmessage = (event) => {
      console.log('WebSocket message:', event.data);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [url]);

  return { ws: wsRef.current, connected };
}

