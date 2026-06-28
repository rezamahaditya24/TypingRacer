'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

type MessageHandler = (data: { type: string; payload: Record<string, unknown> }) => void;

interface UseWebSocketOptions {
  onMessage: MessageHandler;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useWebSocket({ onMessage, onOpen, onClose }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const retryRef = useRef<number | null>(null);
  const retryDelayRef = useRef(1000);
  const shouldReconnectRef = useRef(false);

  onMessageRef.current = onMessage;
  onOpenRef.current = onOpen;
  onCloseRef.current = onClose;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_HOST || `${protocol}//localhost:3001`;
    const ws = new WebSocket(host);

    ws.onopen = () => {
      setConnected(true);
      retryDelayRef.current = 1000;
      onOpenRef.current?.();
    };

    ws.onclose = () => {
      setConnected(false);
      onCloseRef.current?.();

      if (shouldReconnectRef.current) {
        retryRef.current = window.setTimeout(() => {
          connect();
          retryDelayRef.current = Math.min(retryDelayRef.current * 2, 10000);
        }, retryDelayRef.current);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onerror = () => {
      setConnected(false);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  const send = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;
    return () => {
      shouldReconnectRef.current = false;
      if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
      wsRef.current?.close();
    };
  }, []);

  return { connect, disconnect, send, connected, ws: wsRef };
}
