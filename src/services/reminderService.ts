
import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder, CreateReminderParams, ReminderStatus } from "@/types/reminder";
import { notificationService } from "@/services/notificationService";

// Get all reminders
export const getAllReminders = async (): Promise<ServiceReminder[]> => {
  const { data, error } = await supabase
    .from("service_reminders")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching reminders:", error);
    throw error;
  }

  return (data || []).map(mapReminderFromDb);
};

// Get reminders for a specific customer
export const getCustomerReminders = async (customerId: string): Promise<ServiceReminder[]> => {
  const { data, error } = await supabase
    .from("service_reminders")
    .select("*")
    .eq("customer_id", customerId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching customer reminders:", error);
    throw error;
  }

  return (data || []).map(mapReminderFromDb);
};

// Get reminders for a specific vehicle
export const getVehicleReminders = async (vehicleId: string): Promise<ServiceReminder[]> => {
  const { data, error } = await supabase
    .from("service_reminders")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching vehicle reminders:", error);
    throw error;
  }

  return (data || []).map(mapReminderFromDb);
};

// Get upcoming reminders (due in the next X days)
export const getUpcomingReminders = async (days: number = 7): Promise<ServiceReminder[]> => {
  // Calculate target date range
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + days);
  
  const todayStr = today.toISOString().split('T')[0];
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("service_reminders")
    .select("*")
    .gte("due_date", todayStr)
    .lte("due_date", targetDateStr)
    .in("status", ["pending"])
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming reminders:", error);
    throw error;
  }

  return (data || []).map(mapReminderFromDb);
};

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

// Generate service reminders based on service history
export const generateServiceReminders = async (): Promise<number> => {
  // In a real app, this would analyze service history and vehicle data
  // to create appropriate reminders automatically
  // For now, we'll return a placeholder
  return 0;
};

// Helper function to map DB reminder to our type
function mapReminderFromDb(dbReminder: any): ServiceReminder {
  return {
    id: dbReminder.id,
    customerId: dbReminder.customer_id,
    vehicleId: dbReminder.vehicle_id,
    type: dbReminder.type,
    title: dbReminder.title,
    description: dbReminder.description,
    dueDate: dbReminder.due_date,
    status: dbReminder.status,
    notificationSent: dbReminder.notification_sent,
    notificationDate: dbReminder.notification_date,
    createdAt: dbReminder.created_at,
    createdBy: dbReminder.created_by,
    completedAt: dbReminder.completed_at,
    completedBy: dbReminder.completed_by,
    notes: dbReminder.notes
  };
}
