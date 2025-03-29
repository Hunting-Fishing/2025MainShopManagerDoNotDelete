
// This file is deprecated - using the implementation from context/notifications instead
import { useContext } from 'react';
import { NotificationsContext } from './notifications/NotificationsProvider';
import { useNotifications as useNotificationsHook } from './notifications';

export type NotificationContextType = {
  unreadCount: number;
  addNotification: (notification: any) => void;
};

export const useNotifications = () => {
  return useNotificationsHook();
};

// Exporting a dummy provider for backward compatibility
export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
