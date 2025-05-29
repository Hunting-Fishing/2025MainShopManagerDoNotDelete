
import { supabase } from "@/lib/supabase";
import { ServiceReminder } from "./reminderQueries";

export interface ReminderNotification {
  id: string;
  reminder_id: string;
  notification_type: 'email' | 'sms' | 'push' | 'in_app';
  recipient: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export const createReminderNotification = async (
  reminderId: string,
  notificationType: 'email' | 'sms' | 'push' | 'in_app',
  recipient: string
): Promise<ReminderNotification> => {
  try {
    const { data, error } = await supabase
      .from('reminder_notifications')
      .insert([{
        reminder_id: reminderId,
        notification_type: notificationType,
        recipient,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating reminder notification:", error);
    throw error;
  }
};

export const sendReminderNotifications = async (reminder: ServiceReminder): Promise<void> => {
  try {
    // Get the assigned user's notification preferences
    if (reminder.assigned_to) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences, email, phone')
        .eq('id', reminder.assigned_to)
        .single();

      if (profile?.notification_preferences) {
        const prefs = profile.notification_preferences;
        
        // Send email notification if enabled
        if (prefs.email && profile.email) {
          await createReminderNotification(reminder.id, 'email', profile.email);
        }

        // Send SMS notification if enabled
        if (prefs.sms && profile.phone) {
          await createReminderNotification(reminder.id, 'sms', profile.phone);
        }

        // Send push notification if enabled
        if (prefs.push) {
          await createReminderNotification(reminder.id, 'push', reminder.assigned_to);
        }

        // Always send in-app notification
        await createReminderNotification(reminder.id, 'in_app', reminder.assigned_to);
      }
    }
  } catch (error) {
    console.error("Error sending reminder notifications:", error);
  }
};

export const getReminderNotifications = async (reminderId: string): Promise<ReminderNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_notifications')
      .select('*')
      .eq('reminder_id', reminderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reminder notifications:", error);
    return [];
  }
};

export const markNotificationAsSent = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reminder_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking notification as sent:", error);
  }
};

export const markNotificationAsFailed = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reminder_notifications')
      .update({
        status: 'failed'
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking notification as failed:", error);
  }
};

export const getPendingNotifications = async (): Promise<ReminderNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_notifications')
      .select(`
        *,
        service_reminders (
          title,
          due_date,
          customer_id,
          customers (
            first_name,
            last_name
          )
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching pending notifications:", error);
    return [];
  }
};
