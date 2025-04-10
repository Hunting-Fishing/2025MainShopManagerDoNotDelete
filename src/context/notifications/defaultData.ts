
// Clean implementation without mock data
import { NotificationPreferences } from '@/types/notification';

// Default notification preferences - no mock data
export const defaultPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  subscriptions: [
    { category: 'workOrder', enabled: true },
    { category: 'inventory', enabled: true },
    { category: 'invoice', enabled: true },
    { category: 'customer', enabled: true },
    { category: 'team', enabled: true },
    { category: 'system', enabled: true },
    { category: 'chat', enabled: true }
  ]
};

// Empty array - all notifications will be loaded from Supabase
export const sampleNotifications = [];
