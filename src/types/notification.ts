
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: string;
  frequencies: {
    system: "realtime" | "daily" | "weekly" | "off" | "hourly";
    invoice: "realtime" | "daily" | "weekly" | "off" | "hourly";
    workOrder: "realtime" | "daily" | "weekly" | "off" | "hourly";
    inventory: "realtime" | "daily" | "weekly" | "off" | "hourly";
    customer: "realtime" | "daily" | "weekly" | "off" | "hourly";
    team: "realtime" | "daily" | "weekly" | "off" | "hourly";
    chat: "realtime" | "daily" | "weekly" | "off" | "hourly";
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
  link?: string; // Optional link to navigate to when clicked
  sender?: string; // Optional sender ID/info
  recipient?: string; // Optional recipient ID/info
}

export type NotificationSubscription = {
  category: string;
  enabled: boolean;
};
