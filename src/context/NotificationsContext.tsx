
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification, NotificationPreferences, NotificationSubscription } from '@/types/notification';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';

// Sample notifications data (in a real app, this would come from an API)
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Work Order Assigned',
    message: 'You have been assigned to work order #WO-2023-005',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'info',
    link: '/work-orders/5',
    category: 'workOrder',
    priority: 'medium'
  },
  {
    id: '2',
    title: 'Inventory Alert',
    message: 'Oil filters are running low (5 remaining)',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'warning',
    link: '/inventory',
    category: 'inventory',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Invoice Paid',
    message: 'Invoice #INV-2023-042 has been marked as paid',
    read: true,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'success',
    link: '/invoices/42',
    category: 'invoice',
    priority: 'low'
  }
];

// Default notification preferences
const defaultPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  subscriptions: [
    { category: 'workOrder', enabled: true },
    { category: 'inventory', enabled: true },
    { category: 'invoice', enabled: true },
    { category: 'customer', enabled: true },
    { category: 'team', enabled: true },
    { category: 'system', enabled: true }
  ]
};

interface NotificationsContextProps {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: boolean;
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

const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

// Mock user ID for demo purposes
const MOCK_USER_ID = 'user-123';

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

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
  }, []);

  // Function to handle incoming notifications
  const handleNewNotification = useCallback((notification: Notification) => {
    // Check if notification should be shown based on preferences
    const categorySubscription = preferences.subscriptions.find(
      sub => sub.category === notification.category
    );
    
    if (!preferences.inApp || (categorySubscription && !categorySubscription.enabled)) {
      console.log('Notification filtered by preferences:', notification);
      return;
    }
    
    // Add notification to state
    setNotifications(prev => [notification, ...prev]);
    
    // Show toast for high priority notifications
    if (notification.priority === 'high' || !notification.priority) {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    }
  }, [preferences]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
      priority: notificationData.priority || 'medium',
      category: notificationData.category || 'system'
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show a toast when a new notification arrives
    toast({
      title: notificationData.title,
      description: notificationData.message,
      variant: notificationData.type === 'error' ? 'destructive' : 'default',
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPrefs
    }));
  }, []);

  const updateSubscription = useCallback((category: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(sub => 
        sub.category === category ? { ...sub, enabled } : sub
      )
    }));
  }, []);

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

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
