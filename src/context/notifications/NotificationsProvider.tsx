
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Notification, NotificationPreferences } from '@/types/notification';
import { notificationService } from '@/services/notificationService';
import { NotificationsContextProps } from './types';
import { defaultPreferences } from './defaultData';
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
import { supabase } from '@/lib/supabase';

export const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [userId, setUserId] = useState<string | null>(null);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUserId = data?.user?.id;
      setUserId(currentUserId);
    };
    
    getCurrentUser();
    
    // Listen for authentication changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Create handlers
  const handleNewNotification = useCallback(
    createHandleNewNotificationHandler(preferences, setNotifications),
    [preferences]
  );
  
  const addNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      await notificationService.addNotification(notification);
    },
    []
  );
  
  const markAsRead = useCallback(
    async (id: string) => {
      await notificationService.markAsRead(id);
      createMarkAsReadHandler(setNotifications)(id);
    },
    []
  );
  
  const markAllAsRead = useCallback(
    async () => {
      await notificationService.markAllAsRead();
      createMarkAllAsReadHandler(setNotifications)();
    },
    []
  );
  
  const clearNotification = useCallback(
    async (id: string) => {
      await notificationService.clearNotification(id);
      createClearNotificationHandler(setNotifications)(id);
    },
    []
  );
  
  const clearAllNotifications = useCallback(
    async () => {
      await notificationService.clearAllNotifications();
      createClearAllNotificationsHandler(setNotifications)();
    },
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

  // Initialize notification service and set up listeners when user ID changes
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setConnectionStatus(false);
      return;
    }

    // Connect to the notification service
    notificationService.connect(userId);
    
    // Set up listener for connection status
    const unsubscribeStatus = notificationService.onConnectionStatus((status) => {
      setConnectionStatus(status);
    });
    
    // Set up listener for new notifications
    const unsubscribeNotifications = notificationService.onNotification((notification) => {
      handleNewNotification(notification);
    });
    
    // Clean up on unmount or userId change
    return () => {
      unsubscribeStatus();
      unsubscribeNotifications();
      notificationService.disconnect();
    };
  }, [userId, handleNewNotification]);

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
