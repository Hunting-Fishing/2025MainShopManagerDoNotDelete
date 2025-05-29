
import { supabase } from "@/lib/supabase";
import { mapDbServiceReminderToType, mapDbReminderTemplateToType, type DbServiceReminder } from "./reminderMapper";
import type { ServiceReminder, ReminderTemplate } from "@/types/reminder";

export interface CreateReminderData {
  customer_id: string;
  vehicle_id?: string;
  type: string;
  title: string;
  description: string;
  due_date: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
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
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  title?: string;
  description?: string;
}

// Create a new reminder
export const createReminder = async (data: CreateReminderData): Promise<ServiceReminder> => {
  const { data: reminder, error } = await supabase
    .from('service_reminders')
    .insert({
      ...data,
      status: 'pending',
      notification_sent: false,
      created_by: 'system' // TODO: get from auth context
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

  // Add updated_at for compatibility
  const reminderWithUpdatedAt = {
    ...reminder,
    updated_at: reminder.created_at
  };

  return mapDbServiceReminderToType(reminderWithUpdatedAt);
};

// Update an existing reminder
export const updateReminder = async (data: UpdateReminderData): Promise<ServiceReminder> => {
  const updateData: any = { ...data };
  delete updateData.id;

  // Set completed_at if status is completed and not already set
  if (data.status === 'completed' && !data.completed_at) {
    updateData.completed_at = new Date().toISOString();
    updateData.completed_by = 'system'; // TODO: get from auth context
  }

  const { data: reminder, error } = await supabase
    .from('service_reminders')
    .update(updateData)
    .eq('id', data.id)
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

  // Add updated_at for compatibility
  const reminderWithUpdatedAt = {
    ...reminder,
    updated_at: new Date().toISOString()
  };

  return mapDbServiceReminderToType(reminderWithUpdatedAt);
};

// Complete a reminder
export const completeReminder = async (id: string, notes?: string): Promise<ServiceReminder> => {
  return updateReminder({
    id,
    status: 'completed',
    notes,
    completed_at: new Date().toISOString(),
    completed_by: 'system' // TODO: get from auth context
  });
};

// Generate recurring reminders
export const generateRecurringReminders = async (): Promise<ServiceReminder[]> => {
  console.log("Generating recurring reminders...");
  
  try {
    // Get all recurring reminders that need new instances
    const { data: recurringReminders, error } = await supabase
      .from('service_reminders')
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
      .eq('is_recurring', true)
      .is('parent_reminder_id', null);

    if (error) {
      console.error("Error fetching recurring reminders:", error);
      return [];
    }

    const newReminders: ServiceReminder[] = [];

    for (const reminder of recurringReminders || []) {
      // Check if we need to create a new instance
      const nextDue = calculateNextDueDate(reminder);
      
      if (nextDue && new Date(nextDue) <= new Date()) {
        // Create new reminder instance
        const { data: newReminder, error: createError } = await supabase
          .from('service_reminders')
          .insert({
            customer_id: reminder.customer_id,
            vehicle_id: reminder.vehicle_id,
            type: reminder.type,
            title: reminder.title,
            description: reminder.description,
            due_date: nextDue,
            status: 'pending',
            notification_sent: false,
            priority: reminder.priority,
            category_id: reminder.category_id,
            assigned_to: reminder.assigned_to,
            is_recurring: false,
            parent_reminder_id: reminder.id,
            created_by: reminder.created_by,
            notes: reminder.notes
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

        if (createError) {
          console.error("Error creating recurring reminder instance:", createError);
          continue;
        }

        // Add updated_at for compatibility
        const reminderWithUpdatedAt = {
          ...newReminder,
          updated_at: newReminder.created_at
        };

        newReminders.push(mapDbServiceReminderToType(reminderWithUpdatedAt));

        // Update the parent reminder's next occurrence
        await supabase
          .from('service_reminders')
          .update({
            last_occurred_at: nextDue,
            next_occurrence_date: calculateNextDueDate({
              ...reminder,
              last_occurred_at: nextDue
            })
          })
          .eq('id', reminder.id);
      }
    }

    return newReminders;
  } catch (error) {
    console.error("Error generating recurring reminders:", error);
    return [];
  }
};

// Delete a reminder
export const deleteReminder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('service_reminders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

// Helper function to calculate next due date for recurring reminders
function calculateNextDueDate(reminder: any): string | null {
  if (!reminder.is_recurring || !reminder.recurrence_interval || !reminder.recurrence_unit) {
    return null;
  }

  const baseDate = reminder.last_occurred_at ? new Date(reminder.last_occurred_at) : new Date(reminder.due_date);
  const nextDate = new Date(baseDate);

  switch (reminder.recurrence_unit) {
    case 'days':
      nextDate.setDate(nextDate.getDate() + reminder.recurrence_interval);
      break;
    case 'weeks':
      nextDate.setDate(nextDate.getDate() + (reminder.recurrence_interval * 7));
      break;
    case 'months':
      nextDate.setMonth(nextDate.getMonth() + reminder.recurrence_interval);
      break;
    case 'years':
      nextDate.setFullYear(nextDate.getFullYear() + reminder.recurrence_interval);
      break;
    default:
      return null;
  }

  return nextDate.toISOString().split('T')[0];
}

// Create reminder template
export const createReminderTemplate = async (template: Omit<ReminderTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReminderTemplate> => {
  const { data, error } = await supabase
    .from('reminder_templates')
    .insert({
      title: template.title,
      description: template.description,
      category_id: template.categoryId,
      priority: template.priority,
      default_days_until_due: template.defaultDaysUntilDue,
      notification_days_before: template.notificationDaysBefore,
      is_recurring: template.isRecurring,
      recurrence_interval: template.recurrenceInterval,
      recurrence_unit: template.recurrenceUnit,
      created_by: template.createdBy
    })
    .select('*')
    .single();

  if (error) {
    console.error("Error creating reminder template:", error);
    throw error;
  }

  return mapDbReminderTemplateToType(data);
};

// Update reminder template
export const updateReminderTemplate = async (id: string, template: Partial<ReminderTemplate>): Promise<ReminderTemplate> => {
  const { data, error } = await supabase
    .from('reminder_templates')
    .update({
      title: template.title,
      description: template.description,
      category_id: template.categoryId,
      priority: template.priority,
      default_days_until_due: template.defaultDaysUntilDue,
      notification_days_before: template.notificationDaysBefore,
      is_recurring: template.isRecurring,
      recurrence_interval: template.recurrenceInterval,
      recurrence_unit: template.recurrenceUnit,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error("Error updating reminder template:", error);
    throw error;
  }

  return mapDbReminderTemplateToType(data);
};

// Delete reminder template
export const deleteReminderTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('reminder_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting reminder template:", error);
    throw error;
  }
};
