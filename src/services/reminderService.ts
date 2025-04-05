
import { supabase } from "@/lib/supabase";
import { ServiceReminder, CreateReminderParams } from "@/types/reminder";
import { toast } from "@/hooks/use-toast";

// Re-export from specialized services for better organization
export { 
  sendReminderNotification 
} from "./reminders/reminderNotifications";

// Helper function to map database columns to frontend model
const mapReminderFromDb = (data: any): ServiceReminder => {
  return {
    id: data.id,
    customerId: data.customer_id,
    vehicleId: data.vehicle_id,
    type: data.type,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    status: data.status,
    notificationSent: data.notification_sent,
    notificationDate: data.notification_date,
    createdAt: data.created_at,
    createdBy: data.created_by,
    completedAt: data.completed_at,
    completedBy: data.completed_by,
    notes: data.notes
  };
};

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
    .in("status", ["pending", "sent"])
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
    status: "pending",
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
  status: string,
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

  toast({
    title: "Reminder Updated",
    description: `Reminder status updated to ${status}`,
  });

  return mapReminderFromDb(data);
};
