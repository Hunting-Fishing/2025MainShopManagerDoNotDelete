
import { NotificationPreferences } from "@/types/notification";

export const defaultNotificationPreferences: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  inApp: true,
  email: true,
  push: true,
  sound: 'default',
  subscriptions: [
    { category: 'workOrders', enabled: true },
    { category: 'inventory', enabled: true },
    { category: 'invoices', enabled: true },
    { category: 'customers', enabled: true },
    { category: 'team', enabled: true },
    { category: 'system', enabled: true },
    { category: 'chat', enabled: true }
  ],
  categories: {
    system: true,
    workOrders: true,
    invoices: true,
    inventory: true,
    customers: true
  },
  frequencies: {
    workOrders: 'realtime',
    inventory: 'daily',
    invoices: 'realtime',
    customers: 'daily',
    system: 'realtime',
  }
};
