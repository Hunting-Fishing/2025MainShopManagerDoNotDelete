
import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder } from "@/types/reminder";
import { mapReminderFromDb } from "./reminderMapper";
import { toast } from "@/hooks/use-toast";

/**
 * Get reminders that need notifications sent
 * This would typically be used by a background job or cron task
 */
export const getRemindersForNotification = async (): Promise<ServiceReminder[]> => {
  try {
    // Get current date
    const today = new Date().toISOString().split('T')[0];
    
    // Query for pending reminders due soon that haven't had notifications sent
    const { data, error } = await supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('status', 'pending')
      .eq('notification_sent', false)
      .lte('due_date', today) // Due today or in the past
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error("Error getting reminders for notification:", error);
    return [];
  }
};

/**
 * Mark a reminder as having a notification sent
 */
export const markNotificationSent = async (reminderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_reminders')
      .update({
        notification_sent: true,
        notification_date: new Date().toISOString()
      })
      .eq('id', reminderId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error marking notification sent for reminder ${reminderId}:`, error);
    return false;
  }
};

/**
 * Send notifications for all due reminders
 * This is a demo function that would be replaced with actual notification logic
 */
export const sendReminderNotifications = async (): Promise<void> => {
  try {
    // Get reminders that need notifications
    const reminders = await getRemindersForNotification();
    
    if (reminders.length === 0) {
      console.log("No reminders needing notifications");
      return;
    }
    
    // In a real application, this would integrate with email/SMS/push notification services
    for (const reminder of reminders) {
      console.log(`Sending notification for reminder: ${reminder.title} (${reminder.id})`);
      
      // Demo: Just mark the notification as sent
      await markNotificationSent(reminder.id);
      
      // Show a toast for demo purposes
      toast({
        title: "Reminder notification sent",
        description: `For: ${reminder.title} (due: ${reminder.dueDate})`,
      });
    }
    
    console.log(`Processed ${reminders.length} reminder notifications`);
  } catch (error) {
    console.error("Error sending reminder notifications:", error);
    throw error;
  }
};

/**
 * Check if a reminder is due for notification
 */
export const isReminderDueForNotification = (reminder: ServiceReminder): boolean => {
  if (reminder.status !== 'pending' || reminder.notificationSent) {
    return false;
  }
  
  const dueDate = new Date(reminder.dueDate);
  const today = new Date();
  
  // Set hours/minutes/seconds to 0 for date comparison
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  // Due today or in the past
  return dueDate <= today;
};
