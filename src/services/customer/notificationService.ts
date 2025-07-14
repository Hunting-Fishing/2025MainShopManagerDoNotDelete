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
      .from('customer_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('customer_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('customer_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('customer_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Create notification
  async createNotification(notification: CreateNotificationRequest): Promise<CustomerNotification> {
    const { data, error } = await supabase
      .from('customer_notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
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
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          order_updates: true,
          price_alerts: true,
          marketing: false
        })
        .select()
        .single();

      if (insertError) throw insertError;
      data = newData;
    } else if (error) {
      throw error;
    }

    return data!;
  },

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (notification: CustomerNotification) => void) {
    return supabase
      .channel(`customer_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as CustomerNotification);
        }
      )
      .subscribe();
  }
};