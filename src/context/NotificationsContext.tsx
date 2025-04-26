
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationContextType, NotificationPreferences } from '@/types/notification';
import { defaultNotificationPreferences } from './notifications/defaultData';
import { v4 as uuidv4 } from 'uuid';

const NotificationsContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Connect to notifications on mount
  useEffect(() => {
    const connectToNotifications = async () => {
      try {
        setConnectionStatus('connecting');
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConnectionStatus('connected');
        
        // Load any saved preferences from localStorage
        const savedPrefs = localStorage.getItem('notification_preferences');
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }
      } catch (error) {
        console.error('Failed to connect to notifications:', error);
        setConnectionStatus('disconnected');
      }
    };

    connectToNotifications();
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear a specific notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Update notification preferences
  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  // Test notification function
  const triggerTestNotification = () => {
    addNotification({
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info',
      category: 'system'
    });
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    connectionStatus,
    preferences,
    markAsRead,
    markAllAsRead,
    clearNotification,
    updatePreferences,
    triggerTestNotification,
    addNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
