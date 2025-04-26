
import { NotificationPreferences } from "@/types/notification";

export const defaultNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  sound: 'chime',
  categories: {
    workOrders: true,
    inventory: true,
    invoices: true,
    customers: true,
    system: true,
  }
};
