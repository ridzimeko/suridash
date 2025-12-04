import { Tail } from "tail";
import { saveAlert } from "../services/alertService";

const wsClients = new Set<any>();

export function startAlertTailer() {
  const tail = new Tail("/var/log/suricata/eve.json", {
    follow: true,
    useWatchFile: true,
  });

  tail.on("line", async (line) => {
    try {
      const json = JSON.parse(line);

      if (json.event_type === "alert") {
        const saved = await saveAlert(json);

        // broadcast ke semua ws client
        wsClients.forEach((ws) => {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(saved));
          }
        });
      }
    } catch (err) {
      console.error("EVE JSON Parse Error:", err);
    }
  });

  tail.on("error", (err) => {
    console.error("Tailer Failed:", err);
  });

  console.log("Suricata tailer running...");
}