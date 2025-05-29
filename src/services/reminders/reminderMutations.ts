
import { supabase } from "@/lib/supabase";
import { ServiceReminder } from "./reminderQueries";

export interface CreateReminderData {
  customer_id: string;
  vehicle_id?: string;
  type: string;
  title: string;
  description?: string;
  due_date: string;
  status?: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
  category_id?: string;
  recurrence_pattern?: string;
  notes?: string;
  work_order_id?: string;
}

export interface UpdateReminderData extends Partial<CreateReminderData> {
  id: string;
}

export const createReminder = async (reminderData: CreateReminderData): Promise<ServiceReminder> => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
      .insert([{
        ...reminderData,
        created_by: (await supabase.auth.getUser()).data.user?.id || '',
        status: reminderData.status || 'pending',
        priority: reminderData.priority || 'medium'
      }])
      .select(`
        *,
        customers (
          first_name,
          last_name
        ),
        vehicles (
          year,
          make,
          model
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }
};

export const updateReminder = async (updateData: UpdateReminderData): Promise<ServiceReminder> => {
  try {
    const { id, ...updates } = updateData;
    const { data, error } = await supabase
      .from('service_reminders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customers (
          first_name,
          last_name
        ),
        vehicles (
          year,
          make,
          model
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
};

export const completeReminder = async (id: string): Promise<ServiceReminder> => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
      .update({
        status: 'completed',
        last_completed_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customers (
          first_name,
          last_name
        ),
        vehicles (
          year,
          make,
          model
        )
      `)
      .single();

    if (error) throw error;

    // If this is a recurring reminder, generate the next occurrence
    if (data.recurrence_pattern) {
      await generateNextRecurringReminder(data);
    }

    return data;
  } catch (error) {
    console.error("Error completing reminder:", error);
    throw error;
  }
};

export const deleteReminder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

export const bulkUpdateReminders = async (ids: string[], updates: Partial<CreateReminderData>): Promise<ServiceReminder[]> => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select(`
        *,
        customers (
          first_name,
          last_name
        ),
        vehicles (
          year,
          make,
          model
        )
      `);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error bulk updating reminders:", error);
    throw error;
  }
};

const generateNextRecurringReminder = async (completedReminder: ServiceReminder): Promise<void> => {
  try {
    if (!completedReminder.recurrence_pattern) return;

    // Call the database function to generate the next recurring reminder
    const { error } = await supabase.rpc('generate_recurring_reminder', {
      reminder_id: completedReminder.id
    });

    if (error) {
      console.error("Error generating next recurring reminder:", error);
    }
  } catch (error) {
    console.error("Error in generateNextRecurringReminder:", error);
  }
};

export const snoozeReminder = async (id: string, snoozeUntil: string): Promise<ServiceReminder> => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
      .update({
        due_date: snoozeUntil,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customers (
          first_name,
          last_name
        ),
        vehicles (
          year,
          make,
          model
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error snoozing reminder:", error);
    throw error;
  }
};
