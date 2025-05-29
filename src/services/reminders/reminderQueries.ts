
import { supabase } from "@/lib/supabase";

export interface ServiceReminder {
  id: string;
  customer_id: string;
  vehicle_id?: string;
  type: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  category_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  notification_sent: boolean;
  notification_date?: string;
  notes?: string;
  is_recurring?: boolean;
  recurrence_interval?: number;
  recurrence_unit?: string;
  recurrence_pattern?: string;
  last_completed_date?: string;
  work_order_id?: string;
  customers?: {
    first_name: string;
    last_name: string;
  };
  vehicles?: {
    year?: number;
    make?: string;
    model?: string;
  };
}

export interface ReminderCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  is_active: boolean;
}

export interface ReminderTag {
  id: string;
  name: string;
  color?: string;
}

export interface ReminderTemplate {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  priority: 'low' | 'medium' | 'high';
  default_days_until_due: number;
  is_recurring?: boolean;
  recurrence_interval?: number;
  recurrence_unit?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const getAllReminders = async (filters?: any): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
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
      `);

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all reminders:", error);
    return [];
  }
};

export const getCustomerReminders = async (customerId: string, filters?: any): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
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
      .eq('customer_id', customerId);

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching customer reminders:", error);
    return [];
  }
};

export const getVehicleReminders = async (vehicleId: string, filters?: any): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
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
      .eq('vehicle_id', vehicleId);

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching vehicle reminders:", error);
    return [];
  }
};

export const getUpcomingReminders = async (limit = 10, filters?: any): Promise<ServiceReminder[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let query = supabase
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
      .eq('status', 'pending')
      .gte('due_date', today)
      .lte('due_date', oneWeekFromNow)
      .limit(limit);

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error);
    return [];
  }
};

export const getOverdueReminders = async (): Promise<ServiceReminder[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];

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
      .eq('status', 'pending')
      .lt('due_date', today)
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
    const today = new Date().toISOString().split('T')[0];

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
      .eq('status', 'pending')
      .eq('due_date', today)
      .order('created_at', { ascending: true });

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
      .eq('is_active', true)
      .order('name');

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
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reminder tags:", error);
    return [];
  }
};

export const getReminderTemplates = async (): Promise<ReminderTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_templates')
      .select('*')
      .order('title');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reminder templates:", error);
    return [];
  }
};
