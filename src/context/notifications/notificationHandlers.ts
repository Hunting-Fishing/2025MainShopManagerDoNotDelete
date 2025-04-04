import { Notification, NotificationPreferences } from '@/types/notification';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

export const createAddNotificationHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
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
  };
};

export const createMarkAsReadHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
};

export const createMarkAllAsReadHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
};

export const createClearNotificationHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
};

export const createClearAllNotificationsHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return () => {
    setNotifications([]);
  };
};

export const createHandleNewNotificationHandler = (
  preferences: NotificationPreferences,
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return (notification: Notification) => {
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
  };
};
