
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Notification, NotificationPreferences } from '@/types/notification';
import { notificationService } from '@/services/notificationService';
import { NotificationsContextProps } from './types';
import { sampleNotifications, defaultPreferences, MOCK_USER_ID } from './defaultData';
import {
  createAddNotificationHandler,
  createMarkAsReadHandler,
  createMarkAllAsReadHandler,
  createClearNotificationHandler,
  createClearAllNotificationsHandler,
  createHandleNewNotificationHandler,
} from './notificationHandlers';
import {
  createUpdatePreferencesHandler,
  createUpdateSubscriptionHandler,
} from './preferenceHandlers';

export const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Create handlers
  const handleNewNotification = useCallback(
    createHandleNewNotificationHandler(preferences, setNotifications),
    [preferences]
  );
  
  const addNotification = useCallback(
    createAddNotificationHandler(setNotifications),
    []
  );
  
  const markAsRead = useCallback(
    createMarkAsReadHandler(setNotifications),
    []
  );
  
  const markAllAsRead = useCallback(
    createMarkAllAsReadHandler(setNotifications),
    []
  );
  
  const clearNotification = useCallback(
    createClearNotificationHandler(setNotifications),
    []
  );
  
  const clearAllNotifications = useCallback(
    createClearAllNotificationsHandler(setNotifications),
    []
  );
  
  const updatePreferences = useCallback(
    createUpdatePreferencesHandler(setPreferences),
    []
  );
  
  const updateSubscription = useCallback(
    createUpdateSubscriptionHandler(setPreferences),
    []
  );

  // Initialize notification service and set up listeners
  useEffect(() => {
    // Connect to the notification service
    notificationService.connect(MOCK_USER_ID);
    
    // Set up listener for connection status
    const unsubscribeStatus = notificationService.onConnectionStatus((status) => {
      setConnectionStatus(status);
    });
    
    // Set up listener for new notifications
    const unsubscribeNotifications = notificationService.onNotification((notification) => {
      handleNewNotification(notification);
    });
    
    // Clean up on unmount
    return () => {
      unsubscribeStatus();
      unsubscribeNotifications();
      notificationService.disconnect();
    };
  }, [handleNewNotification]);

  const triggerTestNotification = useCallback(() => {
    notificationService.triggerDemoNotification();
  }, []);

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        connectionStatus,
        preferences,
        addNotification, 
        markAsRead, 
        markAllAsRead,
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
