
import { supabase } from "@/lib/supabase";
import { Notification } from "@/types/notification";

/**
 * Service to fetch and manage notifications from Supabase
 */
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      timestamp: notification.timestamp,
      type: notification.type,
      link: notification.link,
      category: notification.category,
      priority: notification.priority || 'medium'
    }));
  } catch (err) {
    console.error('Exception fetching notifications:', err);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
      
    return !error;
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return false;
  }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        link: notification.link,
        read: false,
        user_id: notification.userId
      });
      
    return !error;
  } catch (err) {
    console.error('Error creating notification:', err);
    return false;
  }
}

// Remove demo/mock data - use this function instead of the demo file
export function getNotificationData(type: string) {
  // Real notification templates based on type
  const templates = {
    workOrder: {
      title: "Work Order Update",
      message: "A work order status has changed",
      type: "info",
      category: "workOrder"
    },
    inventory: {
      title: "Inventory Alert",
      message: "Inventory levels have changed",
      type: "warning",
      category: "inventory"
    },
    invoice: {
      title: "Invoice Update",
      message: "An invoice status has changed",
      type: "info",
      category: "invoice"
    }
  };
  
  return templates[type as keyof typeof templates] || templates.workOrder;
}
