
import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder } from "@/types/reminder";
import { mapReminderFromDb } from "./reminderMapper";

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
