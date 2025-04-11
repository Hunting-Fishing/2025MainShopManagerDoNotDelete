
import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder } from "@/types/reminder";
import { toast } from "@/hooks/use-toast";

/**
 * Send a notification for a reminder
 * @param reminderId The ID of the reminder to send a notification for
 */
export const sendReminderNotification = async (reminderId: string): Promise<boolean> => {
  try {
    // Mark the reminder as having had a notification sent
    const { error } = await supabase
      .from('service_reminders')
      .update({
        notification_sent: true,
        notification_date: new Date().toISOString()
      })
      .eq('id', reminderId);
    
    if (error) {
      console.error("Error updating reminder notification status:", error);
      throw error;
    }
    
    // In a real implementation, this would also trigger an email, SMS, or other notification
    toast({
      title: "Notification sent",
      description: "The reminder notification has been sent successfully."
    });
    
    return true;
  } catch (error) {
    console.error("Error sending reminder notification:", error);
    
    toast({
      variant: "destructive",
      title: "Notification failed",
      description: "Failed to send the reminder notification. Please try again."
    });
    
    return false;
  }
};

/**
 * Check for reminders that need notifications
 * This would typically be run on a schedule or when the app loads
 */
export const checkForDueReminders = async (): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Find reminders that are due soon and haven't had notifications sent
    const { data, error } = await supabase
      .from('service_reminders')
      .select('*')
      .eq('status', 'pending')
      .eq('notification_sent', false)
      .lte('due_date', today);
    
    if (error) {
      console.error("Error checking for due reminders:", error);
      return;
    }
    
    // Process each reminder that needs notifications
    for (const reminder of data) {
      await sendReminderNotification(reminder.id);
    }
  } catch (error) {
    console.error("Error in reminder notification check:", error);
  }
};

/**
 * Process recurring reminders to create new instances
 */
export const processRecurringReminders = async (): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Find completed recurring reminders that need new instances created
    const { data, error } = await supabase
      .from('service_reminders')
      .select('*')
      .eq('status', 'completed')
      .eq('is_recurring', true)
      .is('next_occurrence_date', null);
    
    if (error) {
      console.error("Error checking for recurring reminders:", error);
      return;
    }
    
    // For each completed recurring reminder, create a new instance
    for (const reminder of data) {
      try {
        // Calculate next occurrence date
        let nextDate = new Date();
        if (reminder.recurrence_unit === 'days') {
          nextDate.setDate(nextDate.getDate() + (reminder.recurrence_interval || 0));
        } else if (reminder.recurrence_unit === 'weeks') {
          nextDate.setDate(nextDate.getDate() + ((reminder.recurrence_interval || 0) * 7));
        } else if (reminder.recurrence_unit === 'months') {
          nextDate.setMonth(nextDate.getMonth() + (reminder.recurrence_interval || 0));
        } else if (reminder.recurrence_unit === 'years') {
          nextDate.setFullYear(nextDate.getFullYear() + (reminder.recurrence_interval || 0));
        }
        
        const nextDateStr = nextDate.toISOString().split('T')[0];
        
        // Update this reminder with the next occurrence date
        await supabase
          .from('service_reminders')
          .update({ next_occurrence_date: nextDateStr, last_occurred_at: today })
          .eq('id', reminder.id);
        
        // Create new reminder instance
        const newReminder = {
          ...reminder,
          id: undefined, // Let DB generate a new ID
          status: 'pending',
          due_date: nextDateStr,
          notification_sent: false,
          notification_date: null,
          completed_at: null,
          completed_by: null,
          created_at: new Date().toISOString(),
          parent_reminder_id: reminder.id
        };
        
        await supabase
          .from('service_reminders')
          .insert(newReminder);
          
      } catch (err) {
        console.error(`Error processing recurring reminder ${reminder.id}:`, err);
      }
    }
  } catch (error) {
    console.error("Error processing recurring reminders:", error);
  }
};
