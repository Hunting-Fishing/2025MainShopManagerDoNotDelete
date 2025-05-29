
import { supabase } from "@/lib/supabase";
import { 
  mapDbServiceReminderToType, 
  mapDbReminderTemplateToType,
  mapDbReminderCategoryToType,
  DbServiceReminder,
  DbReminderTemplate,
  DbReminderCategory
} from "./reminderMapper";
import { ServiceReminder, ReminderTemplate, ReminderCategory, ReminderTag } from "@/types/reminder";
import { DateRange } from "react-day-picker";

// Re-export types for backwards compatibility
export { ServiceReminder, ReminderTemplate, ReminderCategory, ReminderTag };

export interface RemindersFilters {
  status?: string;
  priority?: string;
  categoryId?: string;
  assignedTo?: string;
  isRecurring?: boolean;
  dateRange?: DateRange;
  tagIds?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
}

export const getAllReminders = async (filters?: RemindersFilters): Promise<ServiceReminder[]> => {
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
          id,
          make,
          model,
          year,
          vin,
          license_plate
        )
      `);

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters?.isRecurring !== undefined) {
      query = query.eq('is_recurring', filters.isRecurring);
    }
    if (filters?.dateRange?.from) {
      query = query.gte('due_date', filters.dateRange.from.toISOString());
    }
    if (filters?.dateRange?.to) {
      query = query.lte('due_date', filters.dateRange.to.toISOString());
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'due_date';
    const sortOrder = filters?.sortOrder || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply limit
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as DbServiceReminder[]).map(mapDbServiceReminderToType);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    throw error;
  }
};

export const getCustomerReminders = async (customerId: string, filters?: RemindersFilters): Promise<ServiceReminder[]> => {
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
          id,
          make,
          model,
          year,
          vin,
          license_plate
        )
      `)
      .eq('customer_id', customerId);

    // Apply additional filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data as DbServiceReminder[]).map(mapDbServiceReminderToType);
  } catch (error) {
    console.error("Error fetching customer reminders:", error);
    throw error;
  }
};

export const getVehicleReminders = async (vehicleId: string, filters?: RemindersFilters): Promise<ServiceReminder[]> => {
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
          id,
          make,
          model,
          year,
          vin,
          license_plate
        )
      `)
      .eq('vehicle_id', vehicleId);

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data as DbServiceReminder[]).map(mapDbServiceReminderToType);
  } catch (error) {
    console.error("Error fetching vehicle reminders:", error);
    throw error;
  }
};

export const getUpcomingReminders = async (limit?: number, filters?: RemindersFilters): Promise<ServiceReminder[]> => {
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
          id,
          make,
          model,
          year,
          vin,
          license_plate
        )
      `)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as DbServiceReminder[]).map(mapDbServiceReminderToType);
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error);
    throw error;
  }
};

export const getOverdueReminders = async (): Promise<ServiceReminder[]> => {
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
          id,
          make,
          model,
          year,
          vin,
          license_plate
        )
      `)
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString())
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data as DbServiceReminder[]).map(mapDbServiceReminderToType);
  } catch (error) {
    console.error("Error fetching overdue reminders:", error);
    throw error;
  }
};

export const getTodaysReminders = async (): Promise<ServiceReminder[]> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    const { data, error } = await supabase
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
      .eq('status', 'pending')
      .gte('due_date', startOfDay)
      .lte('due_date', endOfDay)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data as DbServiceReminder[]).map(mapDbServiceReminderToType);
  } catch (error) {
    console.error("Error fetching today's reminders:", error);
    throw error;
  }
};

export const getReminderTemplates = async (): Promise<ReminderTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as DbReminderTemplate[]).map(mapDbReminderTemplateToType);
  } catch (error) {
    console.error("Error fetching reminder templates:", error);
    return []; // Return empty array instead of throwing
  }
};

export const getReminderCategories = async (): Promise<ReminderCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data as DbReminderCategory[]).map(mapDbReminderCategoryToType);
  } catch (error) {
    console.error("Error fetching reminder categories:", error);
    return []; // Return empty array instead of throwing
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
    return []; // Return empty array instead of throwing
  }
};
