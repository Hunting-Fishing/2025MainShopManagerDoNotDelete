
import React from 'react';
import { NotificationsProvider as ActualNotificationsProvider } from './notifications';
import { useNotifications as useNotificationsHook } from './notifications';

// Export the hook from the new implementation
export const useNotifications = useNotificationsHook;

// Exporting a wrapper provider for backward compatibility
export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  return <ActualNotificationsProvider>{children}</ActualNotificationsProvider>;
};
