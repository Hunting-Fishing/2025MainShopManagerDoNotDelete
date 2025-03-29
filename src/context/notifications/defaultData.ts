
import { Notification, NotificationPreferences } from '@/types/notification';

// Sample notifications data (in a real app, this would come from an API)
export const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Work Order Assigned',
    message: 'You have been assigned to work order #WO-2023-005',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'info',
    link: '/work-orders/5',
    category: 'workOrder',
    priority: 'medium'
  },
  {
    id: '2',
    title: 'Inventory Alert',
    message: 'Oil filters are running low (5 remaining)',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'warning',
    link: '/inventory',
    category: 'inventory',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Invoice Paid',
    message: 'Invoice #INV-2023-042 has been marked as paid',
    read: true,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'success',
    link: '/invoices/42',
    category: 'invoice',
    priority: 'low'
  }
];

// Default notification preferences
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

// Mock user ID for demo purposes
export const MOCK_USER_ID = 'user-123';
