
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Notification, NotificationPreferences } from '@/types/notification';
import { 
  createAddNotificationHandler,
  createMarkAsReadHandler,
  createMarkAllAsReadHandler,
  createClearNotificationHandler,
  createClearAllNotificationsHandler
} from './notificationHandlers';
import { 
  createUpdatePreferencesHandler,
  createUpdateSubscriptionHandler
} from './preferenceHandlers';

// Default notification preferences
const defaultPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  sound: 'default',
  frequencies: {
    system: 'realtime',
    invoice: 'realtime',
    workOrder: 'realtime',
    inventory: 'realtime',
    customer: 'realtime',
    team: 'realtime',
    chat: 'realtime'
  },
  subscriptions: [
    { category: 'system', enabled: true },
    { category: 'invoice', enabled: true },
    { category: 'workOrder', enabled: true },
    { category: 'inventory', enabled: true },
    { category: 'customer', enabled: true },
    { category: 'team', enabled: true },
    { category: 'chat', enabled: true }
  ]
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: boolean;
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  updateSubscription: (category: string, enabled: boolean) => void;
  triggerTestNotification: () => void;
}

export const NotificationsContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  connectionStatus: false,
  preferences: defaultPreferences,
  markAsRead: () => {},
  markAllAsRead: () => {},
  addNotification: () => {},
  clearNotification: () => {},
  clearAllNotifications: () => {},
  updatePreferences: () => {},
  updateSubscription: () => {},
  triggerTestNotification: () => {},
});

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize handlers using the state updater functions
  const markAsRead = createMarkAsReadHandler(setNotifications);
  const markAllAsRead = createMarkAllAsReadHandler(setNotifications);
  const addNotification = createAddNotificationHandler(setNotifications, preferences);
  const clearNotification = createClearNotificationHandler(setNotifications);
  const clearAllNotifications = createClearAllNotificationsHandler(setNotifications);
  const updatePreferences = createUpdatePreferencesHandler(setPreferences);
  const updateSubscription = createUpdateSubscriptionHandler(setPreferences);

  // Simulate a connection status change every 30 seconds for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      // 95% chance to be connected
      setConnectionStatus(Math.random() > 0.05);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Test notification trigger function
  const triggerTestNotification = () => {
    const types = ['info', 'success', 'warning', 'error'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    
    addNotification({
      title: `Test ${type} Notification`,
      message: `This is a test ${type} notification sent at ${new Date().toLocaleTimeString()}`,
      type,
      category: 'system',
      priority: type === 'error' ? 'high' : 'medium'
    });
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        connectionStatus,
        preferences,
        markAsRead, 
        markAllAsRead,
        addNotification,
        clearNotification,
        clearAllNotifications,
        updatePreferences,
        updateSubscription,
        triggerTestNotification
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
