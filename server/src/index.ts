import http from "http";
import app from "./app.js";

import agentsRoute from "./routes/agents.js";
import blockedIpsRoute from "./routes/blocked-ips.js";
import executeRoute from "./routes/execute.js";
import authRoute from "./routes/auth.js";
import alertsRoute from "./routes/alerts.js";
import integrationRoute from "./routes/integrations.js";
import { initWebSocket } from "./ws/index.js";


/* =====================
 * REST ROUTES
 * ===================== */
app.use("/api/agents", agentsRoute);
app.use("/api/blocked-ips", blockedIpsRoute);
app.use("/api/execute", executeRoute);
app.use("/api/auth", authRoute);
app.use("/api/alerts", alertsRoute);
app.use("/api/integrations", integrationRoute);


/* =====================
 * HTTP + WS SERVER
 * ===================== */
const server = http.createServer(app);

initWebSocket(server);

server.listen(3000, () => {
  console.log("🚀 Express + WS running on http://localhost:3000");
});
