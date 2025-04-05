
import { supabase } from "@/lib/supabase";
import { ServiceReminder, ReminderStatus, CreateReminderParams } from "@/types/reminder";
import { DateRange } from "react-day-picker";
import { mapReminderFromDb, mapReminderToDb } from "./reminders/reminderMapper";

interface ReminderFilters {
  status?: string;
  dateRange?: DateRange;
  limit?: number;
}

// Base query builder that applies common filters
const applyReminderFilters = (query: any, filters?: ReminderFilters) => {
  let filteredQuery = query;
  
  // Apply status filter
  if (filters?.status) {
    filteredQuery = filteredQuery.eq('status', filters.status);
  }
  
  // Apply date range filter
  if (filters?.dateRange?.from) {
    const fromDate = filters.dateRange.from.toISOString().split('T')[0];
    filteredQuery = filteredQuery.gte('due_date', fromDate);
    
    if (filters.dateRange.to) {
      const toDate = filters.dateRange.to.toISOString().split('T')[0];
      filteredQuery = filteredQuery.lte('due_date', toDate);
    }
  }
  
  // Apply limit
  if (filters?.limit) {
    filteredQuery = filteredQuery.limit(filters.limit);
  }
  
  return filteredQuery;
};

// Get all reminders with optional filters
export async function getAllReminders(filters?: ReminderFilters): Promise<ServiceReminder[]> {
  try {
    let query = supabase
      .from('service_reminders')
      .select('*')
      .order('due_date', { ascending: true });
      
    query = applyReminderFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error('Error fetching all reminders:', error);
    throw error;
  }
}

// Get reminders for a specific customer with optional filters
export async function getCustomerReminders(customerId: string, filters?: ReminderFilters): Promise<ServiceReminder[]> {
  try {
    let query = supabase
      .from('service_reminders')
      .select('*')
      .eq('customer_id', customerId)
      .order('due_date', { ascending: true });
      
    query = applyReminderFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error(`Error fetching reminders for customer ${customerId}:`, error);
    throw error;
  }
}

// Get reminders for a specific vehicle with optional filters
export async function getVehicleReminders(vehicleId: string, filters?: ReminderFilters): Promise<ServiceReminder[]> {
  try {
    let query = supabase
      .from('service_reminders')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('due_date', { ascending: true });
      
    query = applyReminderFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error(`Error fetching reminders for vehicle ${vehicleId}:`, error);
    throw error;
  }
}

// Get upcoming reminders with optional filters
export async function getUpcomingReminders(days: number, filters?: ReminderFilters): Promise<ServiceReminder[]> {
  try {
    // Calculate the date 'days' from now
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    let query = supabase
      .from('service_reminders')
      .select('*')
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .gte('due_date', today.toISOString().split('T')[0])
      .order('due_date', { ascending: true });
      
    query = applyReminderFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error(`Error fetching upcoming reminders:`, error);
    throw error;
  }
}

// Update a reminder's status
export async function updateReminderStatus(reminderId: string, status: string, notes?: string): Promise<ServiceReminder> {
  try {
    const updateData: any = { status };
    if (notes !== undefined) updateData.notes = notes;
    
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
      updateData.completed_by = "current-user"; // In a real app, get this from auth context
    }
    
    const { data, error } = await supabase
      .from('service_reminders')
      .update(updateData)
      .eq('id', reminderId)
      .select()
      .single();
      
    if (error) throw error;
    return mapReminderFromDb(data);
  } catch (error) {
    console.error(`Error updating reminder status for ${reminderId}:`, error);
    throw error;
  }
}

// Create a new reminder
export async function createReminder(params: CreateReminderParams): Promise<ServiceReminder> {
  try {
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
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
}

// Send a reminder notification
export async function sendReminderNotification(reminderId: string): Promise<ServiceReminder> {
  try {
    // Get the current reminder
    const { data: reminder, error: fetchError } = await supabase
      .from('service_reminders')
      .select('*')
      .eq('id', reminderId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // In a real app, this would trigger an actual notification system
    console.log(`Sending notification for reminder ${reminderId}`);
    
    // Update the reminder to mark notification as sent
    const { data, error } = await supabase
      .from('service_reminders')
      .update({
        notification_sent: true,
        notification_date: new Date().toISOString()
      })
      .eq('id', reminderId)
      .select()
      .single();
      
    if (error) throw error;
    
    return mapReminderFromDb(data);
  } catch (error) {
    console.error(`Error sending notification for reminder ${reminderId}:`, error);
    throw error;
  }
}

// Delete a reminder
export async function deleteReminder(reminderId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_reminders')
      .delete()
      .eq('id', reminderId);
      
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting reminder ${reminderId}:`, error);
    throw error;
  }
}
