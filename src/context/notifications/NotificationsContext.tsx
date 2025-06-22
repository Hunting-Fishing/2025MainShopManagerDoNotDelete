
import React, { createContext } from 'react';
import { Notification } from '@/types/notification';

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);
