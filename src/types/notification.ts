
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category?: string;
  type?: string;
  link?: string;
  priority?: 'high' | 'medium' | 'low';
  source?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean; // Added this
  sound: boolean | string;
  categories: {
    [key: string]: boolean;
  };
  subscriptions: Array<{ category: string; enabled: boolean }>; // Added this
  frequencies: {
    [category: string]: 'realtime' | 'hourly' | 'daily' | 'weekly';
  }; // Added this
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  preferences: NotificationPreferences;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void;
  triggerTestNotification: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}
