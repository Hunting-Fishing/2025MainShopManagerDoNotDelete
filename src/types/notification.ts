
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category?: string;
  type?: string;
  link?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sound: boolean | string;
  categories: {
    [key: string]: boolean;
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  preferences: NotificationPreferences;
  clearNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void;
  triggerTestNotification: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}
