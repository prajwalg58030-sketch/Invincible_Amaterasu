"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TelemetryPayload } from "@/types/telemetry";

export function useTelemetrySocket(
  url: string = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws/stream"
) {
  const [data, setData] = useState<TelemetryPayload | null>(null);
  const [history, setHistory] = useState<TelemetryPayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeChaos, setActiveChaos] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  useEffect(() => {
    shouldReconnectRef.current = true;

    function connect() {
      if (wsRef.current) {
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current === ws) {
          setIsConnected(true);
        }
      };

      ws.onmessage = (event) => {
        try {
          const payload: TelemetryPayload = JSON.parse(event.data);
          setData(payload);
          setHistory((prev) => [...prev.slice(-29), payload]);
        } catch (err) {
          console.error("[useTelemetrySocket] Parse error:", err);
        }
      };

      ws.onerror = () => {
        if (wsRef.current === ws && ws.readyState === WebSocket.OPEN) {
          console.warn("[useTelemetrySocket] WebSocket encountered an error.");
        }
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          setIsConnected(false);
          wsRef.current = null;

          if (shouldReconnectRef.current) {
            reconnectTimeoutRef.current = setTimeout(connect, 2000);
          }
        }
      };
    }

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url]);

  const injectChaos = useCallback((attackType: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "chaos_inject", attack_type: attackType }));
      setActiveChaos(attackType);
    }
  }, []);

  const clearChaos = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "chaos_clear" }));
      setActiveChaos(null);
    }
  }, []);

  const jumpScenario = useCallback((index: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setHistory([]);
      setActiveChaos(null);
      wsRef.current.send(JSON.stringify({ action: "jump_scenario", index }));
    }
  }, []);

  return {
    data,
    history,
    isConnected,
    activeChaos,
    injectChaos,
    clearChaos,
    jumpScenario,
  };
}