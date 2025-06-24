
import { Notification, NotificationPreferences } from '@/types/notification';

export const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to AutoShop Pro',
    message: 'Your account has been set up successfully. Start managing your shop today!',
    type: 'success',
    category: 'system',
    timestamp: new Date().toISOString(),
    read: false
  }
];

export const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  categories: {
    system: true,
    'work-order': true,
    inventory: true,
    customer: true,
    team: true
  },
  frequency: 'immediate',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};
