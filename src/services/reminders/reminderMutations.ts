
import { supabase } from "@/lib/supabase";
import type { ServiceReminder } from "@/types/reminder";
import { mapDbServiceReminderToType } from "./reminderMapper";

export interface CreateReminderData {
  customer_id: string;
  vehicle_id?: string;
  type: string;
  title: string;
  description: string;
  due_date: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  category_id?: string;
  assigned_to?: string;
  template_id?: string;
  is_recurring?: boolean;
  recurrence_interval?: number;
  recurrence_unit?: string;
}

export interface UpdateReminderData {
  id: string;
  status?: 'pending' | 'completed' | 'overdue' | 'cancelled';
  notes?: string;
  completed_at?: string;
  completed_by?: string;
}

// Create a new reminder
export const createReminder = async (reminderData: CreateReminderData): Promise<ServiceReminder> => {
  const { data, error } = await supabase
    .from('service_reminders')
    .insert({
      ...reminderData,
      status: 'pending',
      created_by: 'current-user', // This should come from auth context
      notification_sent: false,
    })
    .select(`
      *,
      customers (
        first_name,
        last_name
      ),
      vehicles (
        id,
        make,
        model,
        year,
        vin,
        license_plate
      )
    `)
    .single();

  if (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }

  return mapDbServiceReminderToType({
    ...data,
    updated_at: data.created_at
  });
};

// Update an existing reminder
export const updateReminder = async (updateData: UpdateReminderData): Promise<ServiceReminder> => {
  const updatePayload: any = {
    updated_at: new Date().toISOString()
  };

  if (updateData.status !== undefined) {
    updatePayload.status = updateData.status;
  }
  
  if (updateData.notes !== undefined) {
    updatePayload.notes = updateData.notes;
  }
  
  if (updateData.completed_at !== undefined) {
    updatePayload.completed_at = updateData.completed_at;
  }
  
  if (updateData.completed_by !== undefined) {
    updatePayload.completed_by = updateData.completed_by;
  }

  const { data, error } = await supabase
    .from('service_reminders')
    .update(updatePayload)
    .eq('id', updateData.id)
    .select(`
      *,
      customers (
        first_name,
        last_name
      ),
      vehicles (
        id,
        make,
        model,
        year,
        vin,
        license_plate
      )
    `)
    .single();

  if (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }

  return mapDbServiceReminderToType({
    ...data,
    updated_at: data.updated_at || data.created_at
  });
};

// Complete a reminder
export const completeReminder = async (reminderId: string): Promise<ServiceReminder> => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('service_reminders')
    .update({
      status: 'completed',
      completed_at: now,
      completed_by: 'current-user', // This should come from auth context
      updated_at: now
    })
    .eq('id', reminderId)
    .select(`
      *,
      customers (
        first_name,
        last_name
      ),
      vehicles (
        id,
        make,
        model,
        year,
        vin,
        license_plate
      )
    `)
    .single();

  if (error) {
    console.error("Error completing reminder:", error);
    throw error;
  }

  // Handle recurring reminders
  if (data.is_recurring && data.recurrence_interval && data.recurrence_unit) {
    await createNextRecurrence(data);
  }

  return mapDbServiceReminderToType({
    ...data,
    updated_at: data.updated_at || data.created_at
  });
};

// Create next occurrence for recurring reminders
const createNextRecurrence = async (reminderData: any): Promise<void> => {
  const currentDueDate = new Date(reminderData.due_date);
  let nextDueDate = new Date(currentDueDate);

  // Calculate next due date based on recurrence pattern
  switch (reminderData.recurrence_unit) {
    case 'days':
      nextDueDate.setDate(nextDueDate.getDate() + reminderData.recurrence_interval);
      break;
    case 'weeks':
      nextDueDate.setDate(nextDueDate.getDate() + (reminderData.recurrence_interval * 7));
      break;
    case 'months':
      nextDueDate.setMonth(nextDueDate.getMonth() + reminderData.recurrence_interval);
      break;
    case 'years':
      nextDueDate.setFullYear(nextDueDate.getFullYear() + reminderData.recurrence_interval);
      break;
  }

  const { error } = await supabase
    .from('service_reminders')
    .insert({
      customer_id: reminderData.customer_id,
      vehicle_id: reminderData.vehicle_id,
      type: reminderData.type,
      title: reminderData.title,
      description: reminderData.description,
      due_date: nextDueDate.toISOString().split('T')[0],
      status: 'pending',
      priority: reminderData.priority,
      category_id: reminderData.category_id,
      assigned_to: reminderData.assigned_to,
      template_id: reminderData.template_id,
      is_recurring: true,
      recurrence_interval: reminderData.recurrence_interval,
      recurrence_unit: reminderData.recurrence_unit,
      parent_reminder_id: reminderData.id,
      created_by: reminderData.created_by,
      notification_sent: false,
    });

  if (error) {
    console.error("Error creating next recurrence:", error);
  }
};

// Generate bulk reminders (for recurring or template-based reminders)
export const generateBulkReminders = async (reminders: CreateReminderData[]): Promise<ServiceReminder[]> => {
  const { data, error } = await supabase
    .from('service_reminders')
    .insert(reminders.map(reminder => ({
      ...reminder,
      status: 'pending',
      created_by: 'current-user',
      notification_sent: false,
    })))
    .select(`
      *,
      customers (
        first_name,
        last_name
      ),
      vehicles (
        id,
        make,
        model,
        year,
        vin,
        license_plate
      )
    `);

  if (error) {
    console.error("Error generating bulk reminders:", error);
    throw error;
  }

  return data.map(item => mapDbServiceReminderToType({
    ...item,
    updated_at: item.created_at
  }));
};

// Delete a reminder
export const deleteReminder = async (reminderId: string): Promise<void> => {
  // First check if this reminder has any children (recurring reminders)
  const { data: children } = await supabase
    .from('service_reminders')
    .select('id')
    .eq('parent_reminder_id', reminderId);

  if (children && children.length > 0) {
    // Delete children first
    await supabase
      .from('service_reminders')
      .delete()
      .eq('parent_reminder_id', reminderId);
  }

  const { error } = await supabase
    .from('service_reminders')
    .delete()
    .eq('id', reminderId);

  if (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

// Create reminder template
export const createReminderTemplate = async (templateData: any): Promise<any> => {
  const { data, error } = await supabase
    .from('reminder_templates')
    .insert({
      ...templateData,
      created_by: 'current-user',
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating reminder template:", error);
    throw error;
  }

  return mapDbServiceReminderToType({
    ...data,
    updated_at: data.created_at
  });
};

// Create reminder category
export const createReminderCategory = async (categoryData: any): Promise<any> => {
  const { data, error } = await supabase
    .from('reminder_categories')
    .insert({
      ...categoryData,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating reminder category:", error);
    throw error;
  }

  return data;
};

// Create reminder tag
export const createReminderTag = async (tagData: any): Promise<any> => {
  const { data, error } = await supabase
    .from('reminder_tags')
    .insert(tagData)
    .select()
    .single();

  if (error) {
    console.error("Error creating reminder tag:", error);
    throw error;
  }

  return data;
};
