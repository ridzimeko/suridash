import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export function useRealtimeAlerts() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [alerts, setAlerts] = useState<any[]>([]);
    const [status, setStatus] = useState<"connected" | "disconnected" | "error">("disconnected");

    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        function connect() {
            const BASE_URL_API = (import.meta.env.VITE_BASE_URL_API || "ws://localhost:3000/api").replace(/^http/, "ws");
            const ws = new WebSocket(`${BASE_URL_API}/alerts/realtime`);
            wsRef.current = ws;

            // Connected
            ws.onopen = () => {
                setStatus("connected");
                toast.success("Connected to Realtime Alerts WebSocket");
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setAlerts((prev) => [data, ...prev]); // prepend alert baru
            };

            ws.onerror = () => {
                console.error("Realtime alerts WebSocket error");
            };

            // Closed (auto reconnect)
            ws.onclose = () => {
                setStatus("disconnected");
                toast.warning("WebSocket disconnected — retrying in 7s...");

                setTimeout(() => {
                    connect(); // reconnect automatically
                }, 7000);
            };
        }

        connect();

        return () => {
            wsRef.current?.close();
        };
    }, []);

    return { alerts, status };
}
