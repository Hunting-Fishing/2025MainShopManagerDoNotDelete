import { supabase } from '@/integrations/supabase/client';
import type { Notification, NotificationPreferences } from '@/types/notification';

export async function getNotifications(userId?: string): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return (data || []).map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as 'info' | 'warning' | 'error' | 'success',
    category: notification.category as any,
    timestamp: notification.timestamp,
    read: notification.read,
    priority: notification.priority as 'low' | 'medium' | 'high',
    actionUrl: notification.link
  }));
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function createNotification(
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'> & { userId: string }
): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      priority: notification.priority,
      action_url: notification.actionUrl
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    message: data.message,
    type: data.type as any,
    category: data.category as any,
    timestamp: data.timestamp,
    read: data.read,
    priority: data.priority as any,
    actionUrl: data.link
  };
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching notification preferences:', error);
    return null;
  }

  if (!data) {
    return getDefaultPreferences();
  }

  return {
    emailNotifications: data.email_enabled,
    pushNotifications: data.push_enabled,
    smsNotifications: data.sms_enabled,
    email: data.email_enabled,
    push: data.push_enabled,
    inApp: true, // Default since we don't have this field
    categories: (data.preferences as any)?.categories || {},
    subscriptions: (data.preferences as any)?.subscriptions || [],
    frequency: (data.preferences as any)?.frequency || 'immediate',
    frequencies: (data.preferences as any)?.frequencies || {},
    sound: (data.preferences as any)?.sound || 'default',
    quietHours: (data.preferences as any)?.quietHours || {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  };
}

export async function updateNotificationPreferences(
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      email_enabled: preferences.email,
      push_enabled: preferences.push,
      sms_enabled: preferences.smsNotifications,
      preferences: JSON.stringify({
        categories: preferences.categories || {},
        subscriptions: preferences.subscriptions || [],
        frequency: preferences.frequency || 'immediate',
        frequencies: preferences.frequencies || {},
        sound: preferences.sound || 'default',
        quietHours: preferences.quietHours || { enabled: false, start: '22:00', end: '08:00' },
        inApp: preferences.inApp || true
      })
    });

  if (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

function getDefaultPreferences(): NotificationPreferences {
  return {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    email: true,
    push: true,
    inApp: true,
    categories: {
      system: true,
      'work-order': true,
      inventory: true,
      customer: false,
      team: true,
      chat: true,
      invoice: false
    },
    subscriptions: [],
    frequency: 'immediate',
    frequencies: {},
    sound: 'default',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  };
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}