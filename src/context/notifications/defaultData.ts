
import { NotificationPreferences } from "@/types/notification";

export const defaultNotificationPreferences: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  categories: {
    system: true,
    workOrders: true,
    invoices: true,
    inventory: true,
    customers: true
  }
};
