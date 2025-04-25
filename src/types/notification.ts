
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
  category?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  source?: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
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
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  triggerTestNotification: () => void;
}

export interface WorkOrderNotification extends Notification {
  workOrderId: string;
  priority?: 'low' | 'medium' | 'high';
  action?: string;
}
