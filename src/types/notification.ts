
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: string;
  frequencies: {
    system: "realtime" | "daily" | "weekly" | "off";
    invoice: "realtime" | "daily" | "weekly" | "off";
    workOrder: "realtime" | "daily" | "weekly" | "off";
    inventory: "realtime" | "daily" | "weekly" | "off";
    customer: "realtime" | "daily" | "weekly" | "off";
    team: "realtime" | "daily" | "weekly" | "off";
    chat: "realtime" | "daily" | "weekly" | "off";
  };
  subscriptions: {
    category: string;
    enabled: boolean;
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  category: "system" | "invoice" | "workOrder" | "inventory" | "customer" | "team" | "chat";
  duration?: number;
}
