
// This file is deprecated - using the implementation from context/notifications instead
import { useContext } from 'react';
import { NotificationsContext } from './notifications/NotificationsProvider';

export type NotificationContextType = {
  unreadCount: number;
  showNotifications: () => void;
  triggerTestNotification: () => void;
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

// Exporting a dummy provider for backward compatibility
export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
