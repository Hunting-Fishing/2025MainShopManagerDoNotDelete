import { supabase } from "@/integrations/supabase/client";

export interface CustomerNotification {
  id: string;
  user_id: string;
  order_id?: string;
  type: 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'price_drop' | 'back_in_stock' | 'wishlist_update';
  title: string;
  message: string;
  read: boolean;
  email_sent: boolean;
  sms_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  price_alerts: boolean;
  marketing: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  order_id?: string;
  type: CustomerNotification['type'];
  title: string;
  message: string;
}

export const customerNotificationService = {
  // Get user notifications
  async getUserNotifications(userId: string, limit = 50): Promise<CustomerNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.map(item => ({
      id: item.id,
      user_id: item.user_id,
      order_id: null,
      type: 'order_confirmed' as const,
      title: item.title,
      message: item.message,
      read: item.read,
      email_sent: false,
      sms_sent: false,
      created_at: item.timestamp,
      updated_at: item.timestamp
    })) || [];
  },

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Create notification
  async createNotification(notification: CreateNotificationRequest): Promise<CustomerNotification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: 'info'
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      user_id: data.user_id,
      order_id: null,
      type: 'order_confirmed' as const,
      title: data.title,
      message: data.message,
      read: data.read,
      email_sent: false,
      sms_sent: false,
      created_at: data.timestamp,
      updated_at: data.timestamp
    };
  },

  // Get user notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    let { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create default preferences if none exist
      const { data: newData, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          email_enabled: true,
          sms_enabled: false,
          push_enabled: true,
          preferences: {
            order_updates: true,
            price_alerts: true,
            marketing: false
          }
        })
        .select()
        .single();

      if (insertError) throw insertError;
      data = newData;
    } else if (error) {
      throw error;
    }

    // Map to expected interface
    return {
      id: data.id,
      user_id: data.user_id,
      email_notifications: data.email_enabled,
      sms_notifications: data.sms_enabled,
      push_notifications: data.push_enabled,
      order_updates: (data.preferences as any)?.order_updates || true,
      price_alerts: (data.preferences as any)?.price_alerts || true,
      marketing: (data.preferences as any)?.marketing || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<NotificationPreferences> {
    const updateData = {
      email_enabled: preferences.email_notifications,
      sms_enabled: preferences.sms_notifications,
      push_enabled: preferences.push_notifications,
      preferences: {
        order_updates: preferences.order_updates,
        price_alerts: preferences.price_alerts,
        marketing: preferences.marketing
      }
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      user_id: data.user_id,
      email_notifications: data.email_enabled,
      sms_notifications: data.sms_enabled,
      push_notifications: data.push_enabled,
      order_updates: (data.preferences as any)?.order_updates || true,
      price_alerts: (data.preferences as any)?.price_alerts || true,
      marketing: (data.preferences as any)?.marketing || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (notification: CustomerNotification) => void) {
    return supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const mapped = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            order_id: null,
            type: 'order_confirmed' as const,
            title: payload.new.title,
            message: payload.new.message,
            read: payload.new.read,
            email_sent: false,
            sms_sent: false,
            created_at: payload.new.timestamp,
            updated_at: payload.new.timestamp
          };
          callback(mapped as CustomerNotification);
        }
      )
      .subscribe();
  }
};