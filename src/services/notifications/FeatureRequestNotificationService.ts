import { supabase } from '@/integrations/supabase/client';

export class FeatureRequestNotificationService {
  /**
   * Process pending notifications by sending them via edge function
   */
  static async processPendingNotifications() {
    try {
      // Get all unsent notifications
      const { data: notifications, error } = await supabase
        .from('feature_request_notifications')
        .select('*')
        .eq('sent', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Process each notification
      for (const notification of notifications || []) {
        try {
          const { error: functionError } = await supabase.functions.invoke(
            'send-feature-request-notification',
            {
              body: { notification_id: notification.id }
            }
          );

          if (functionError) {
            console.error('Error sending notification:', functionError);
          }
        } catch (error) {
          console.error('Error invoking notification function:', error);
        }
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }

  /**
   * Get notification preferences for current user
   */
  static async getUserNotificationPreferences() {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return data;
  }

  /**
   * Update notification preferences for current user
   */
  static async updateNotificationPreferences(preferences: {
    email_notifications?: boolean;
    slack_webhook_url?: string;
    discord_webhook_url?: string;
  }) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get notification history for admin dashboard
   */
  static async getNotificationHistory(limit = 50) {
    const { data, error } = await supabase
      .from('feature_request_notifications')
      .select(`
        *,
        feature_requests (
          id,
          title,
          submitter_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get webhook logs for monitoring
   */
  static async getWebhookLogs(limit = 100) {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching webhook logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Test webhook by sending a test notification
   */
  static async testWebhook(webhookUrl: string, type: 'slack' | 'discord') {
    try {
      const testPayload = type === 'slack' 
        ? {
            text: '🧪 Test notification from Feature Request system',
            attachments: [{
              color: 'good',
              text: 'If you see this message, your webhook is working correctly!'
            }]
          }
        : {
            embeds: [{
              title: '🧪 Test Notification',
              description: 'If you see this message, your webhook is working correctly!',
              color: 0x00ff00
            }]
          };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });

      // Log the test
      await supabase.from('webhook_logs').insert({
        webhook_type: type,
        webhook_url: webhookUrl,
        payload: { test: true },
        response_status: response.status,
        success: response.ok
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }
}

// Auto-process notifications every 30 seconds when the service is imported
if (typeof window !== 'undefined') {
  setInterval(() => {
    FeatureRequestNotificationService.processPendingNotifications();
  }, 30000);
}