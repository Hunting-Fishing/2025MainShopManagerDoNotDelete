
import { Notification, NotificationPreferences, NotificationSubscription } from '@/types/notification';

export interface NotificationsContextProps {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
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
