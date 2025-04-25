
export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  link?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotificationSubscription {
  category: string;
  enabled: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound?: 'default' | 'chime' | 'bell' | 'soft' | 'none';
  subscriptions: NotificationSubscription[];
  frequencies: Record<string, 'realtime' | 'hourly' | 'daily' | 'weekly'>;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: boolean;
  preferences: NotificationPreferences;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  updateSubscription: (category: string, enabled: boolean) => void;
  triggerTestNotification: () => void;
}

export const defaultPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  sound: 'default',
  subscriptions: [
    { category: 'workOrder', enabled: true },
    { category: 'inventory', enabled: true },
    { category: 'invoice', enabled: true },
    { category: 'customer', enabled: true },
    { category: 'team', enabled: true },
    { category: 'system', enabled: true },
    { category: 'chat', enabled: true }
  ],
  frequencies: {
    workOrder: 'realtime',
    inventory: 'realtime',
    invoice: 'realtime',
    customer: 'realtime',
    team: 'realtime',
    system: 'realtime',
    chat: 'realtime'
  }
};
