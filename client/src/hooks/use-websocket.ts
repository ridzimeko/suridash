import { useEffect, useRef } from "react";
import { useMetricsStore } from "@/store/metrics-store";
import { useAgentStatusStore } from "@/store/agent-status-store";

const RETRY_DELAY = 3000; // 3 detik

export function useWebsocket() {
  const addMetric = useMetricsStore((s) => s.addMetric);
  const wsRef = useRef<WebSocket | null>(null);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      const ws = new WebSocket(
        `${import.meta.env.VITE_WS_BASE_URL}/ws/dashboard`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Dashboard WS connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WS message received:", data);
          if (data.type === "system_metrics") {
            addMetric(data);
          }

          if (data.type === "agent_status") {
            useAgentStatusStore
              .getState()
              .setStatus(data.agentId, data.payload);
          }
        } catch (err) {
          console.error("Invalid WS message", err);
        }
      };

      ws.onclose = () => {
        console.warn("⚠️ Dashboard WS disconnected, retrying...");
        retryTimeout.current = setTimeout(connect, RETRY_DELAY);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      wsRef.current?.close();
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [addMetric]);
}
