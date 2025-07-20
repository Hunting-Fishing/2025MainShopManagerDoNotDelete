
import { supabase } from '@/integrations/supabase/client';
import { NotificationPreferences } from '@/types/notification';

export interface NotificationFilter {
  userId: string;
  category: string;
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

class NotificationControlService {
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_preferences')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const defaultPreferences: NotificationPreferences = {
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
          customer: true,
          team: true,
          chat: true,
          invoice: true,
        },
        subscriptions: [
          { category: 'system', enabled: true },
          { category: 'work-order', enabled: true },
          { category: 'inventory', enabled: true },
          { category: 'customer', enabled: true },
          { category: 'team', enabled: true },
          { category: 'chat', enabled: true },
          { category: 'invoice', enabled: true },
        ],
        frequency: 'immediate',
        frequencies: {
          system: 'realtime',
          'work-order': 'realtime',
          inventory: 'daily',
          customer: 'realtime',
          team: 'realtime',
          chat: 'realtime',
          invoice: 'realtime',
        },
        sound: 'default',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      };

      return data?.notification_preferences || defaultPreferences;
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      throw error;
    }
  }

  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  shouldSendNotification(
    preferences: NotificationPreferences,
    category: string,
    method: 'email' | 'push' | 'inApp'
  ): boolean {
    // Check if the notification method is enabled
    if (!preferences[method]) return false;

    // Check if the category is enabled
    const categoryEnabled = preferences.categories[category as keyof typeof preferences.categories];
    if (!categoryEnabled) return false;

    // Check quiet hours
    if (preferences.quietHours.enabled && method !== 'inApp') {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = this.parseTime(preferences.quietHours.start);
      const endTime = this.parseTime(preferences.quietHours.end);

      if (startTime <= endTime) {
        // Same day quiet hours
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      } else {
        // Overnight quiet hours
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      }
    }

    return true;
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }

  async scheduleNotification(
    userId: string,
    category: string,
    notification: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      actionUrl?: string;
    }
  ): Promise<void> {
    try {
      const preferences = await this.getUserNotificationPreferences(userId);
      const frequency = preferences.frequencies[category] || 'realtime';

      if (frequency === 'realtime') {
        // Send immediately if allowed
        await this.sendNotification(userId, category, notification, preferences);
      } else {
        // Queue for batch sending
        await this.queueNotification(userId, category, notification, frequency);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  private async sendNotification(
    userId: string,
    category: string,
    notification: any,
    preferences: NotificationPreferences
  ): Promise<void> {
    // Check each method and send if enabled
    if (this.shouldSendNotification(preferences, category, 'inApp')) {
      await this.sendInAppNotification(userId, notification);
    }

    if (this.shouldSendNotification(preferences, category, 'email')) {
      await this.sendEmailNotification(userId, notification);
    }

    if (this.shouldSendNotification(preferences, category, 'push')) {
      await this.sendPushNotification(userId, notification);
    }
  }

  private async sendInAppNotification(userId: string, notification: any): Promise<void> {
    // Implementation for in-app notifications
    console.log('Sending in-app notification:', { userId, notification });
  }

  private async sendEmailNotification(userId: string, notification: any): Promise<void> {
    // Implementation for email notifications
    console.log('Sending email notification:', { userId, notification });
  }

  private async sendPushNotification(userId: string, notification: any): Promise<void> {
    // Implementation for push notifications
    console.log('Sending push notification:', { userId, notification });
  }

  private async queueNotification(
    userId: string,
    category: string,
    notification: any,
    frequency: string
  ): Promise<void> {
    // Implementation for queuing notifications
    console.log('Queuing notification:', { userId, category, notification, frequency });
  }
}

export const notificationControlService = new NotificationControlService();
