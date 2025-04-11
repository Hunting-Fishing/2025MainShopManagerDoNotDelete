
// Import statements and service functions
import { supabase } from "@/integrations/supabase/client";
import { mapReminderFromDb, mapCategoryFromDb, mapTemplateFromDb } from "./reminderMapper";
import { ServiceReminder, ReminderCategory, ReminderTemplate } from "@/types/reminder";
import { DateRange } from "react-day-picker";

interface ReminderFilters {
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

/**
 * Get all reminder categories
 * @returns A list of categories
 */
export const getReminderCategories = async (): Promise<ReminderCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return (data || []).map(mapCategoryFromDb);
  } catch (error) {
    console.error("Error getting reminder categories:", error);
    return [];
  }
};

/**
 * Get all reminder templates
 * @returns A list of templates
 */
export const getReminderTemplates = async (): Promise<ReminderTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_templates')
      .select(`
        *,
        categories:category_id(*)
      `)
      .order('title');
    
    if (error) throw error;
    
    return (data || []).map(mapTemplateFromDb);
  } catch (error) {
    console.error("Error getting reminder templates:", error);
    return [];
  }
};

/**
 * Get template by ID
 * @param id Template ID
 * @returns The reminder template
 */
export const getReminderTemplateById = async (id: string): Promise<ReminderTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('reminder_templates')
      .select(`
        *,
        categories:category_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return mapTemplateFromDb(data);
  } catch (error) {
    console.error("Error getting reminder template:", error);
    return null;
  }
};

/**
 * Get all reminders with optional filters
 * @param filters Optional filters to apply
 * @returns A list of reminder objects
 */
export const getAllReminders = async (filters?: ReminderFilters): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `);
    
    // Apply filters
    query = applyFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error("Error getting all reminders:", error);
    return [];
  }
};

/**
 * Get reminders for a specific customer
 * @param customerId Customer ID
 * @param filters Optional filters
 * @returns List of reminders for the customer
 */
export const getCustomerReminders = async (customerId: string, filters?: ReminderFilters): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('customer_id', customerId);
    
    // Apply filters
    query = applyFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error(`Error getting reminders for customer ${customerId}:`, error);
    return [];
  }
};

/**
 * Get reminders for a specific vehicle
 * @param vehicleId Vehicle ID
 * @param filters Optional filters
 * @returns List of reminders for the vehicle
 */
export const getVehicleReminders = async (vehicleId: string, filters?: ReminderFilters): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('vehicle_id', vehicleId);
    
    // Apply filters
    query = applyFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error(`Error getting reminders for vehicle ${vehicleId}:`, error);
    return [];
  }
};

/**
 * Get upcoming reminders, limited by count
 * @param limit Maximum number of reminders to retrieve
 * @param filters Optional filters
 * @returns List of upcoming reminders
 */
export const getUpcomingReminders = async (limit: number = 5, filters?: ReminderFilters): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('status', 'pending')
      .order('due_date', { ascending: true });
    
    // Apply additional filters if provided
    if (filters) {
      // We've already set status to pending for upcoming reminders
      const { status, ...otherFilters } = filters;
      query = applyFilters(query, otherFilters);
    }
    
    // Apply limit
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error('Error getting upcoming reminders:', error);
    return [];
  }
};

/**
 * Get a reminder by ID
 * @param id Reminder ID
 * @returns The reminder object or null if not found
 */
export const getReminderById = async (id: string): Promise<ServiceReminder | null> => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return mapReminderFromDb(data);
  } catch (error) {
    console.error(`Error getting reminder by ID ${id}:`, error);
    return null;
  }
};

/**
 * Get all reminder tags
 * @returns List of reminder tags
 */
export const getReminderTags = async () => {
  try {
    const { data, error } = await supabase
      .from('reminder_tags')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error getting reminder tags:", error);
    return [];
  }
};

/**
 * Helper function to apply filters to a query
 * @param query The base query
 * @param filters The filters to apply
 * @returns The query with filters applied
 */
const applyFilters = (query: any, filters?: ReminderFilters) => {
  if (!filters) return query;
  
  // Apply status filter
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  // Apply priority filter
  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }
  
  // Apply category filter
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  
  // Apply assignment filter
  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }
  
  // Apply recurring filter
  if (filters.isRecurring !== undefined) {
    query = query.eq('is_recurring', filters.isRecurring);
  }
  
  // Apply date range filter
  if (filters.dateRange?.from) {
    query = query.gte('due_date', filters.dateRange.from.toISOString().split('T')[0]);
    
    if (filters.dateRange.to) {
      query = query.lte('due_date', filters.dateRange.to.toISOString().split('T')[0]);
    }
  }
  
  // Apply search filter - basic implementation
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  // Apply sorting
  if (filters.sortBy) {
    const sortOrder: "asc" | "desc" = filters.sortOrder || "asc";
    const dbFieldName = convertFieldNameToDb(filters.sortBy);
    query = query.order(dbFieldName, { ascending: sortOrder === "asc" });
  } else {
    // Default sort by due date
    query = query.order('due_date', { ascending: true });
  }
  
  // Apply limit if specified
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  return query;
};

/**
 * Convert frontend field names to database field names
 */
const convertFieldNameToDb = (fieldName: string): string => {
  const fieldMap: Record<string, string> = {
    'dueDate': 'due_date',
    'createdAt': 'created_at',
    'completedAt': 'completed_at',
    'notificationDate': 'notification_date',
    'assignedTo': 'assigned_to',
    // Add more mappings as needed
  };
  
  return fieldMap[fieldName] || fieldName;
};
