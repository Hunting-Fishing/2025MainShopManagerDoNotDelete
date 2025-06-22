
import { NotificationPreferences, Notification } from '@/types/notification';

export const defaultPreferences: NotificationPreferences = {
  email: true,
  push: false,
  inApp: true,
  sound: 'default',
  frequencies: {
    system: 'realtime',
    invoice: 'realtime',
    workOrder: 'realtime',
    inventory: 'daily',
    customer: 'hourly',
    team: 'realtime',
    chat: 'realtime'
  },
  subscriptions: [
    { category: 'system', enabled: true },
    { category: 'invoice', enabled: true },
    { category: 'workOrder', enabled: true },
    { category: 'inventory', enabled: true },
    { category: 'customer', enabled: true },
    { category: 'team', enabled: true },
    { category: 'chat', enabled: true }
  ]
};

export const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to the system',
    message: 'Your notification system is now active',
    read: false,
    timestamp: new Date().toISOString(),
    type: 'info',
    category: 'system'
  }
];
