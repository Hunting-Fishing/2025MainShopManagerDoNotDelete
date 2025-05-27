
import { Notification, NotificationPreferences } from '@/types/notification';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { playNotificationSound } from '@/utils/notificationSounds';

export const createAddNotificationHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
  preferences: NotificationPreferences
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
    
    // Play notification sound with better error handling
    if (preferences.sound && preferences.sound !== 'none') {
      playNotificationSound(preferences.sound)
        .then(() => {
          console.log('Notification sound played successfully');
        })
        .catch(err => {
          console.warn('Error playing notification sound:', err);
          // Don't show error to user, just log it
        });
    }
    
    // Show a toast when a new notification arrives with improved error handling
    try {
      toast({
        title: notificationData.title,
        description: notificationData.message,
        variant: notificationData.type === 'error' ? 'destructive' : 'default',
        // Set a reasonable duration for notifications (longer for important ones)
        duration: notificationData.priority === 'high' ? 10000 : 
                 notificationData.type === 'error' ? 8000 : 
                 notificationData.duration || 6000
      });
    } catch (error) {
      console.error('Error showing toast notification:', error);
    }
  };
};

export const createMarkAsReadHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return (id: string) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
};

export const createMarkAllAsReadHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return () => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
};

export const createClearNotificationHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return (id: string) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };
};

export const createClearAllNotificationsHandler = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return () => {
    try {
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };
};

export const createHandleNewNotificationHandler = (
  preferences: NotificationPreferences,
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  return (notification: Notification) => {
    try {
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
      
      // Check if notification should be shown based on frequency settings
      const category = notification.category || 'system';
      const frequency = preferences.frequencies?.[category] || 'realtime';
      
      // Only show toast and play sound for realtime notifications
      if (frequency === 'realtime') {
        // Play notification sound with proper error handling
        if (preferences.sound && preferences.sound !== 'none') {
          playNotificationSound(preferences.sound)
            .then(() => {
              console.log('New notification sound played successfully');
            })
            .catch(err => {
              console.warn('Error playing new notification sound:', err);
            });
        }
        
        // Show toast for high priority notifications or based on frequency
        if (notification.priority === 'high' || !notification.priority) {
          try {
            toast({
              title: notification.title,
              description: notification.message,
              variant: notification.type === 'error' ? 'destructive' : 'default',
              // Extended duration based on priority and type
              duration: notification.priority === 'high' ? 10000 : 
                       notification.type === 'error' ? 8000 : 
                       notification.duration || 6000
            });
          } catch (error) {
            console.error('Error showing new notification toast:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error handling new notification:', error);
    }
  };
};
