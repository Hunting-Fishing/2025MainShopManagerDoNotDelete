
import { supabase } from "@/lib/supabase";

export interface ServiceReminder {
  id: string;
  customer_id: string;
  vehicle_id?: string;
  type: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  category_id?: string;
  recurrence_pattern?: string;
  last_completed_date?: string;
  next_due_date?: string;
  notes?: string;
  work_order_id?: string;
}

export interface ReminderCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderTag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

export const getServiceReminders = async (): Promise<ServiceReminder[]> => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
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
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching service reminders:", error);
    return [];
  }
};

export const getReminderById = async (id: string): Promise<ServiceReminder | null> => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
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
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching reminder:", error);
    return null;
  }
};

export const getOverdueReminders = async (): Promise<ServiceReminder[]> => {
  try {
    const today = new Date().toISOString();
    const { data, error } = await supabase
      .from('service_reminders')
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
      .lt('due_date', today)
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching overdue reminders:", error);
    return [];
  }
};

export const getTodaysReminders = async (): Promise<ServiceReminder[]> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from('service_reminders')
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
      .gte('due_date', startOfDay)
      .lte('due_date', endOfDay)
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching today's reminders:", error);
    return [];
  }
};

export const getReminderCategories = async (): Promise<ReminderCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reminder categories:", error);
    return [];
  }
};

export const getReminderTags = async (): Promise<ReminderTag[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reminder tags:", error);
    return [];
  }
};

export const getRemindersByCustomer = async (customerId: string): Promise<ServiceReminder[]> => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
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
      .eq('customer_id', customerId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching customer reminders:", error);
    return [];
  }
};

export const getUpcomingReminders = async (days: number = 7): Promise<ServiceReminder[]> => {
  try {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const { data, error } = await supabase
      .from('service_reminders')
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
      .gte('due_date', today.toISOString())
      .lte('due_date', futureDate.toISOString())
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error);
    return [];
  }
};
