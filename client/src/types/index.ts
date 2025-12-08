export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type LogLevel = 'info' | 'warning' | 'error';
export type ServiceStatus = 'running' | 'stopped' | 'error';
export type RuleAction = 'alert' | 'drop' | 'reject';

export interface Alert {
  id: string;
  timestamp: Date;
  severity: number;
  category: string;
  signature: string;
  srcIp: string;
  srcPort: number;
  destIp: string;
  destPort: number;
  protocol: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  blocked: boolean;
}

export interface Rule {
  id: string;
  sid: number;
  enabled: boolean;
  action: RuleAction;
  protocol: string;
  source: string;
  destination: string;
  rule: string;
  description: string;
  category: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source: string;
}

export interface SystemStats {
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  totalAlerts: number;
  blockedIPs: number;
  activeRules: number;
  serviceStatus: ServiceStatus;
}

export interface BlockedIP {
  id: string;
  ip: string;
  country: string;
  city: string;
  countryCode: string;
  reason: string;
  createdAt: Date;
  blockedUntil: Date;
  duration: string;
  alertCount: number;
}

export interface AttackStats {
  type: string;
  count: number;
  percentage: number;
}

export interface TimelineData {
  timestamp: string;
  ddos: number;
  portScan: number;
  bruteForce: number;
  malware: number;
  other: number;
}

export interface NotificationConfig {
  email: {
    enabled: boolean;
    smtp: string;
    port: number;
    username: string;
    password: string;
    from: string;
    to: string[];
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  whatsapp: {
    enabled: boolean;
    apiKey: string;
    phoneNumber: string;
  };
}

export interface AuthUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
};

export interface Integration {
  id: number;
  enabled: boolean;
  provider: string;
  config: Record<string, unknown>;
}