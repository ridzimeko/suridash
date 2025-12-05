import { Tail } from "tail";
import { saveAlert } from "../services/alertService";
import fs from "fs";

const wsClients = new Set<any>();

const EVE_PATH = "/var/log/suricata/eve.json";

export function startAlertTailer() {
  if (!fs.existsSync(EVE_PATH)) {
    console.warn("[Tailer] eve.json not found. Please check Suricata configuration.");
    return;
  }

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

  console.log("[Tailer] Suricata tailer running...");
}