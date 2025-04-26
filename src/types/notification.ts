
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
  priority?: 'low' | 'medium' | 'high';
  status?: string;
}

export interface NotificationSubscription {
  category: string;
  enabled: boolean;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  
  // Add these fields to match what components are using
  inApp: boolean;
  email: boolean;
  push: boolean;
  sound?: string;
  subscriptions: NotificationSubscription[];
  frequencies?: Record<string, 'realtime' | 'hourly' | 'daily' | 'weekly'>;
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
  status?: string;
}

// Add missing NotificationsListProps for WorkOrderNotifications component
export interface NotificationsListProps {
  notifications: WorkOrderNotification[];
  loading?: boolean;
}
