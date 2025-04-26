
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  category?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  actionText?: string;
  actionLink?: string;
}

export interface WorkOrderNotification extends Notification {
  workOrderId: string;
}

export interface NotificationPreferences {
  sound: string | boolean;
  email: boolean;
  push: boolean;
  desktop: boolean;
  browser: boolean;
  subscriptions: NotificationSubscription[];
}

export interface NotificationSubscription {
  category: string;
  enabled: boolean;
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
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  triggerTestNotification: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  updateSubscription: (category: string, enabled: boolean) => void;
}

export interface NotificationsListProps {
  notifications: WorkOrderNotification[];
  onMarkAsRead: (id: string) => void;
  loading?: boolean;
}

export interface NotificationItemProps {
  notification: WorkOrderNotification;
  onMarkAsRead: (id: string) => void;
}
