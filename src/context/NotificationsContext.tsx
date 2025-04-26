
import React, { createContext, useState, useEffect, useCallback } from "react";
import { Notification, NotificationContextType, NotificationPreferences } from "@/types/notification";
import { playNotificationSound } from "@/utils/notificationSounds";

// Default notification preferences
const defaultNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  sound: "chime",
  categories: {
    workOrders: true,
    inventory: true,
    invoices: true,
    customers: true,
    system: true
  },
  subscriptions: [
    { category: "workOrders", enabled: true },
    { category: "inventory", enabled: true },
    { category: "invoices", enabled: true },
    { category: "customers", enabled: true },
    { category: "system", enabled: true }
  ],
  frequencies: {
    workOrders: "realtime",
    inventory: "realtime",
    invoices: "daily",
    customers: "hourly",
    system: "realtime"
  }
};

export const NotificationsContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  connectionStatus: 'disconnected',
  preferences: defaultNotificationPreferences,
  clearNotification: () => {},
  clearAllNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  updatePreferences: () => {},
  triggerTestNotification: () => {},
  addNotification: () => {}
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Handle clearing a notification
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  // Add a notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Play sound if enabled
    if (preferences.sound) {
      const soundToPlay = typeof preferences.sound === 'string' ? preferences.sound : 'chime';
      try {
        playNotificationSound(soundToPlay);
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }
  }, [preferences.sound]);

  // Add a demo/test notification
  const triggerTestNotification = useCallback(() => {
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      title: "Test Notification",
      message: "This is a test notification",
      read: false,
      timestamp: new Date().toISOString(),
      category: "system",
      type: "info"
    };
    
    setNotifications(prev => [testNotification, ...prev]);
    try {
      playNotificationSound('chime');
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  // Connect to notification service on mount
  useEffect(() => {
    // Simulate connecting to notification service
    setConnectionStatus('connecting');
    const timeout = setTimeout(() => {
      setConnectionStatus('connected');
    }, 1000);

    // Add some demo notifications
    const demoNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Work Order',
        message: 'A new work order has been created',
        read: false,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        category: 'workOrders',
        link: '/work-orders/123'
      },
      {
        id: '2',
        title: 'Low Inventory Alert',
        message: 'Oil Filter (SKU: OIL-F-103) is running low',
        read: true,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        category: 'inventory',
        link: '/inventory'
      }
    ];
    setNotifications(demoNotifications);

    // Clean up
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const value = {
    notifications,
    unreadCount,
    connectionStatus,
    preferences,
    clearNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    triggerTestNotification,
    addNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
