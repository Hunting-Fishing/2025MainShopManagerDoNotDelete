
import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder, CreateReminderParams, ReminderStatus } from "@/types/reminder";
import { mapReminderFromDb, mapReminderToDb } from "./reminderMapper";

// Create a new reminder
export const createReminder = async (params: CreateReminderParams): Promise<ServiceReminder> => {
  const currentUser = "current-user"; // In a real app, get this from auth context

  const reminderData = {
    customer_id: params.customerId,
    vehicle_id: params.vehicleId || null,
    type: params.type,
    title: params.title,
    description: params.description,
    due_date: params.dueDate,
    status: "pending" as ReminderStatus,
    notification_sent: false,
    created_by: currentUser,
    notes: params.notes || null
  };

  const { data, error } = await supabase
    .from("service_reminders")
    .insert(reminderData)
    .select()
    .single();

  if (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }

  return mapReminderFromDb(data);
};

// Update reminder status
export const updateReminderStatus = async (
  reminderId: string, 
  status: ReminderStatus,
  notes?: string
): Promise<ServiceReminder> => {
  const currentUser = "current-user"; // In a real app, get this from auth context
  
  const updateData: any = {
    status: status
  };
  
  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
    updateData.completed_by = currentUser;
  }
  
  if (notes) {
    updateData.notes = notes;
  }

  const { data, error } = await supabase
    .from("service_reminders")
    .update(updateData)
    .eq("id", reminderId)
    .select()
    .single();

  if (error) {
    console.error("Error updating reminder status:", error);
    throw error;
  }

  return mapReminderFromDb(data);
};
