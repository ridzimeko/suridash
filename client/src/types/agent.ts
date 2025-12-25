export interface Agent {
    id: string
    name: string
    hostname: string
    status: "online" | "offline"
    createdAt: string
  }