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
  expiresAt?: string;
}

export interface NotificationSubscription {
  category: string;
  enabled: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound?: 'default' | 'none' | 'soft' | 'loud' | 'bell' | 'chime' | 'alert';
  frequencies?: {
    [key: string]: 'realtime' | 'hourly' | 'daily' | 'weekly';
  };
  subscriptions: NotificationSubscription[];
}

// Work order specific notification types
export interface WorkOrderNotification {
  id: string;
  workOrderId: string;
  notificationType: 'status_update' | 'completion' | 'cancellation' | 'assignment';
  title: string;
  message: string;
  recipientType: 'customer' | 'technician';
  recipientId: string;
  status: 'pending' | 'sent' | 'error';
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  triggerStatus: string;
  nextStatus: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  isActive: boolean;
}
