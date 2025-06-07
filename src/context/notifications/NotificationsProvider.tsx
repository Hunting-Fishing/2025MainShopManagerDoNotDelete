import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuthUser } from '@/hooks/useAuthUser';
import { supabase } from '@/integrations/supabase/client';
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
import { preloadNotificationSounds } from '@/utils/notificationSounds';
import { safeDOMOperation } from '@/utils/domSafetyUtils';

export const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [userId, setUserId] = useState<string | null>(null);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Get current user ID on mount with error handling
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const currentUserId = data?.user?.id;
        setUserId(currentUserId);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    
    getCurrentUser();
    
    // Listen for authentication changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        setUserId(session?.user?.id || null);
      } catch (error) {
        console.error('Error handling auth state change:', error);
      }
    });
    
    // Preload notification sounds with error handling
    safeDOMOperation(
      () => preloadNotificationSounds(),
      undefined,
      'notification sound preloading'
    );
    
    return () => {
      try {
        authListener?.subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from auth listener:', error);
      }
    };
  }, []);

  // Create handlers with error boundaries
  const handleNewNotification = useCallback(
    createHandleNewNotificationHandler(preferences, setNotifications),
    [preferences]
  );
  
  const addNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      try {
        const handler = createAddNotificationHandler(setNotifications, preferences);
        handler(notification);
        await notificationService.addNotification(notification);
      } catch (error) {
        console.error('Error adding notification:', error);
      }
    },
    [preferences]
  );
  
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationService.markAsRead(id);
        createMarkAsReadHandler(setNotifications)(id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    []
  );
  
  const markAllAsRead = useCallback(
    async () => {
      try {
        await notificationService.markAllAsRead();
        createMarkAllAsReadHandler(setNotifications)();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },
    []
  );
  
  const clearNotification = useCallback(
    async (id: string) => {
      try {
        await notificationService.clearNotification(id);
        createClearNotificationHandler(setNotifications)(id);
      } catch (error) {
        console.error('Error clearing notification:', error);
      }
    },
    []
  );
  
  const clearAllNotifications = useCallback(
    async () => {
      try {
        await notificationService.clearAllNotifications();
        createClearAllNotificationsHandler(setNotifications)();
      } catch (error) {
        console.error('Error clearing all notifications:', error);
      }
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

    try {
      // Connect to the notification service
      notificationService.connect(userId);
      
      // Set up listener for connection status
      const unsubscribeStatus = notificationService.onConnectionStatus((status) => {
        try {
          setConnectionStatus(status);
        } catch (error) {
          console.error('Error updating connection status:', error);
        }
      });
      
      // Set up listener for new notifications
      const unsubscribeNotifications = notificationService.onNotification((notification) => {
        try {
          handleNewNotification(notification);
        } catch (error) {
          console.error('Error handling new notification:', error);
        }
      });
      
      // Clean up on unmount or userId change
      return () => {
        try {
          unsubscribeStatus();
          unsubscribeNotifications();
          notificationService.disconnect();
        } catch (error) {
          console.error('Error cleaning up notification service:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }, [userId, handleNewNotification]);

  const triggerTestNotification = useCallback(() => {
    try {
      notificationService.triggerDemoNotification();
    } catch (error) {
      console.error('Error triggering test notification:', error);
    }
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
