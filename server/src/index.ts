import http from "http";
import { WebSocketServer } from "ws";
import app from "./app.js";

import agentsRoute from "./routes/agents.js";
import blockedIpsRoute from "./routes/blocked-ips.js";
import executeRoute from "./routes/execute.js";
import authRoute from "./routes/auth.js";
import alertsRoute from "./routes/alerts.js";
import integrationRoute from "./routes/integrations.js";
import { initAgentWs } from "./ws/agent.js";

/* =====================
 * REST ROUTES
 * ===================== */
app.use("/api/agents", agentsRoute);
app.use("/api/blocked-ips", blockedIpsRoute);
app.use("/api/execute", executeRoute);
app.use("/api/auth", authRoute);
app.use("/api/alerts", alertsRoute);
app.use("/api/integration", integrationRoute);

/* =====================
 * HTTP + WS SERVER
 * ===================== */
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

initAgentWs(wss);

server.listen(3000, () => {
  console.log("🚀 Express + WS running on http://localhost:3000");
});
