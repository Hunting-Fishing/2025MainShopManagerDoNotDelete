
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";

// Send notification for a reminder
export const sendReminderNotification = async (reminderId: string): Promise<boolean> => {
  // First get the reminder details to craft notification
  const { data: reminder, error } = await supabase
    .from("service_reminders")
    .select(`
      *,
      customers (email, first_name, last_name),
      vehicles (make, model, year)
    `)
    .eq("id", reminderId)
    .single();

  if (error) {
    console.error("Error fetching reminder details:", error);
    throw error;
  }

  // Create notification content
  const customerName = `${reminder.customers.first_name} ${reminder.customers.last_name}`;
  const vehicleInfo = reminder.vehicles 
    ? `${reminder.vehicles.year} ${reminder.vehicles.make} ${reminder.vehicles.model}`
    : "your vehicle";

  // Add notification to notification system
  await notificationService.triggerDemoNotification();

  // Update reminder to mark notification as sent
  const { error: updateError } = await supabase
    .from("service_reminders")
    .update({
      notification_sent: true,
      notification_date: new Date().toISOString()
    })
    .eq("id", reminderId);

  if (updateError) {
    console.error("Error updating reminder notification status:", updateError);
    throw updateError;
  }

  return true;
};
