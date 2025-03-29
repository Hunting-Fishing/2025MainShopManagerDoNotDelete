
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '@/types/notification';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

// Sample notifications data (in a real app, this would come from an API)
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Work Order Assigned',
    message: 'You have been assigned to work order #WO-2023-005',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'info',
    link: '/work-orders/5'
  },
  {
    id: '2',
    title: 'Inventory Alert',
    message: 'Oil filters are running low (5 remaining)',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'warning',
    link: '/inventory'
  },
  {
    id: '3',
    title: 'Invoice Paid',
    message: 'Invoice #INV-2023-042 has been marked as paid',
    read: true,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'success',
    link: '/invoices/42'
  }
];

interface NotificationsContextProps {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show a toast when a new notification arrives
    toast({
      title: notificationData.title,
      description: notificationData.message,
      variant: notificationData.type === 'error' ? 'destructive' : 'default',
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        addNotification, 
        markAsRead, 
        markAllAsRead,
        clearNotification
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
