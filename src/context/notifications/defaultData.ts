
import { NotificationPreferences } from "@/types/notification";

export const defaultNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  desktop: true,
  browser: true,
  sound: 'chime',
  categories: {
    workOrders: true,
    inventory: true,
    invoices: true,
    customers: true,
    system: true,
  },
  subscriptions: [
    { category: 'workOrders', enabled: true },
    { category: 'inventory', enabled: true },
    { category: 'invoices', enabled: true },
    { category: 'customers', enabled: true },
    { category: 'system', enabled: true }
  ],
  frequencies: {
    workOrders: 'realtime',
    inventory: 'realtime',
    invoices: 'realtime',
    customers: 'realtime',
    system: 'realtime'
  }
};
