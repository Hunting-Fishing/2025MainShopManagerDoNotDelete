
import { Notification, NotificationPreferences } from '@/types/notification';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
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
    
    // Play notification sound based on preferences
    if (preferences.sound && preferences.sound !== 'none') {
      playNotificationSound(preferences.sound).catch(err => {
        console.error('Error playing notification sound:', err);
      });
    }
    
    // Show a toast when a new notification arrives
    toast(notificationData.title, {
      description: notificationData.message,
      position: "top-right",
      duration: notificationData.priority === 'high' ? 10000 : 
               notificationData.type === 'error' ? 8000 : 
               notificationData.duration || 6000
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
