
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  sender?: string;
  recipient?: string;
  category?: 'system' | 'invoice' | 'workOrder' | 'inventory' | 'customer' | 'team' | 'chat';
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

export type NotificationSubscription = {
  category: string;
  enabled: boolean;
}

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  inApp: boolean;
  subscriptions: NotificationSubscription[];
}
