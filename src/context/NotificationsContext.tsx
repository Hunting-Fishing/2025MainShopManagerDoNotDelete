
// This file is deprecated - using the implementation from context/notifications instead
import React from 'react';
import { NotificationsProvider as NewNotificationsProvider } from './notifications';
import { useNotifications as useNotificationsHook } from './notifications';

// Re-export the hook for backward compatibility
export const useNotifications = () => {
  return useNotificationsHook();
};

// Exporting a provider that uses the new implementation
export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  return <NewNotificationsProvider>{children}</NewNotificationsProvider>;
};

// This context is no longer used directly - only kept for compatibility
export const NotificationsContext = React.createContext(null);
