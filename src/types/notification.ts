
import { ReactNode } from "react";

// Notification for system-wide notifications
export interface Notification {
  id: string;
  timestamp: Date;
  title: string;
  message: string;
  read: boolean;
  type: string;
  link?: string;
  sender?: string;
  recipient?: string;
  category?: string;
}

// Notification preferences for users
export interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  subscriptions: NotificationSubscription[];
}

export interface NotificationSubscription {
  category: string;
  enabled: boolean;
}

// Work order specific notifications
export interface WorkOrderNotification {
  id: string;
  workOrderId: string;
  notificationType: "status_update" | "assignment" | "completion" | "cancellation" | "schedule_update" | "automation";
  title: string;
  message: string;
  recipientType: "technician" | "customer" | "admin" | "system";
  recipientId: string;
  status: "pending" | "sent" | "error";
  sentAt?: string;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Notification system context type
export interface NotificationsContextProps {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: boolean;
  preferences: NotificationPreferences;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  updatePreferences: (newPrefs: Partial<NotificationPreferences>) => void;
  updateSubscription: (category: string, enabled: boolean) => void;
  triggerTestNotification: () => void;
}
