"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TelemetryPayload } from "@/types/telemetry";

export function useTelemetrySocket(url: string = "ws://localhost:8000/ws/stream") {
  const [data, setData] = useState<TelemetryPayload | null>(null);
  const [history, setHistory] = useState<TelemetryPayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeChaos, setActiveChaos] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const payload: TelemetryPayload = JSON.parse(event.data);
        setData(payload);
        setHistory((prev) => [...prev.slice(-29), payload]);
      } catch (err) {
        console.error("Failed to parse telemetry frame", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const injectChaos = useCallback((attackType: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "chaos_inject", attack_type: attackType }));
      setActiveChaos(attackType);
    }
  }, []);

  const clearChaos = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "chaos_clear" }));
      setActiveChaos(null);
    }
  }, []);

  const jumpScenario = useCallback((index: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "jump_scenario", index }));
    }
  }, []);

  return { data, history, isConnected, activeChaos, injectChaos, clearChaos, jumpScenario };
}