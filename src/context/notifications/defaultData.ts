
import { NotificationPreferences } from '@/types/notification';

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
