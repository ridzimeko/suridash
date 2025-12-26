import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

type WSContext = {
  agentId: string;
};

const agentSockets = new Map();

export const agentWs = new Hono();

const { upgradeWebSocket } = createNodeWebSocket({ app: agentWs });

agentWs.get(
  "/ws/agent",
  upgradeWebSocket((c) => {
    const agentId = c.req.header("x-agent-id");

    if (!agentId) {
      throw new Error("Missing agent id");
    }

    console.log(agentId)

    return {
      onOpen(_, ws) {
        agentSockets.set(agentId, ws);
        console.log(`Agent connected: ${agentId}`);
      },

      onClose() {
        agentSockets.delete(agentId);
        console.log(`Agent disconnected: ${agentId}`);
      },
    };
  })
);

export function sendCommandToAgent(
  agentId: string,
  payload: any
) {
  const ws = agentSockets.get(agentId);
  if (!ws) return false;

  ws.send(JSON.stringify(payload));
  return true;
}