export type AppEnv = {
  Variables: {
    user: any | null;
    session: any | null;
  };
};

export interface Alert {
  id?: string;
  createdAt: Date;
  severity: number;
  category: string;
  signature: string;
  signatureId: number | null;
  srcIp: string;
  srcPort: number;
  destIp: string;
  destPort: number;
  protocol: string;
  country: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  wasBlocked: boolean;
}