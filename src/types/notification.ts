
import { ReactNode } from 'react';

export interface WorkOrderNotification {
  id: string;
  work_order_id: string;
  notification_type: string;
  title: string;
  message: string;
  recipient_type: string;
  recipient_id: string;
  status: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  link?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  sender?: string;
  recipient?: string;
  expires_at?: string;
}

export interface NotificationSubscription {
  category: string;
  enabled: boolean;
}

export interface NotificationPreferences {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
  sound?: 'default' | 'none' | 'subtle' | 'loud';
  frequencies?: {
    [category: string]: 'realtime' | 'hourly' | 'daily' | 'weekly';
  };
  subscriptions: NotificationSubscription[];
}
