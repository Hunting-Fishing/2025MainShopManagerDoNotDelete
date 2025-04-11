
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapReminderFromDb } from "./reminderMapper";

/**
 * Send a notification for a service reminder
 * @param reminderId The ID of the reminder to send notification for
 * @returns A boolean indicating whether the notification was successfully sent
 */
export const sendReminderNotification = async (reminderId: string): Promise<boolean> => {
  try {
    // 1. Get the reminder
    const { data: reminder, error: reminderError } = await supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('id', reminderId)
      .single();

    if (reminderError) throw reminderError;

    if (!reminder) {
      console.error("Reminder not found:", reminderId);
      return false;
    }

    // 2. Get customer information to send the notification
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone, communication_preference')
      .eq('id', reminder.customer_id)
      .single();

    if (customerError) throw customerError;

    if (!customer) {
      console.error("Customer not found for reminder:", reminderId);
      return false;
    }

    // 3. Mark the reminder as notification sent
    const { error: updateError } = await supabase
      .from('service_reminders')
      .update({
        notification_sent: true,
        notification_date: new Date().toISOString()
      })
      .eq('id', reminderId);

    if (updateError) throw updateError;

    // 4. Record this as a customer communication
    // This would normally connect to an email or SMS service in a real implementation
    const { error: commError } = await supabase
      .from('customer_communications')
      .insert({
        customer_id: customer.id,
        type: determineNotificationType(customer),
        direction: 'outgoing',
        status: 'sent',
        subject: `Reminder: ${reminder.title}`,
        content: reminder.description,
        staff_member_id: reminder.created_by,
        staff_member_name: 'System' // Would use the actual name in a real implementation
      });

    if (commError) {
      console.error("Error recording communication:", commError);
      // Don't fail the whole operation just because we couldn't log it
    }

    return true;
  } catch (error) {
    console.error("Error sending reminder notification:", error);
    toast({
      title: "Error",
      description: "Failed to send notification.",
      variant: "destructive",
    });
    return false;
  }
};

// Helper function to determine notification type based on customer preferences
function determineNotificationType(customer: any): string {
  if (!customer.communication_preference || customer.communication_preference === 'email') {
    return 'email';
  }
  
  if (customer.communication_preference === 'sms' && customer.phone) {
    return 'sms';
  }
  
  // Default to email if preference is invalid or required data is missing
  return 'email';
}
