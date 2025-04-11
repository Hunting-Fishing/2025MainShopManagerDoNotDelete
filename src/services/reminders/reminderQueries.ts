
import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder, ReminderCategory, ReminderTag, ReminderTemplate } from "@/types/reminder";
import { mapReminderFromDb, mapCategoryFromDb, mapTagFromDb, mapTemplateFromDb } from "./reminderMapper";
import { DateRange } from "react-day-picker";

interface ReminderFilters {
  status?: string;
  priority?: string;
  categoryId?: string;
  assignedTo?: string;
  dateRange?: DateRange;
  isRecurring?: boolean;
  tagIds?: string[];
  search?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Base query builder that applies common filters
const applyReminderFilters = (query: any, filters?: ReminderFilters) => {
  let filteredQuery = query;
  
  // Apply status filter
  if (filters?.status) {
    filteredQuery = filteredQuery.eq('status', filters.status);
  }
  
  // Apply priority filter
  if (filters?.priority) {
    filteredQuery = filteredQuery.eq('priority', filters.priority);
  }
  
  // Apply category filter
  if (filters?.categoryId) {
    filteredQuery = filteredQuery.eq('category_id', filters.categoryId);
  }
  
  // Apply assigned to filter
  if (filters?.assignedTo) {
    filteredQuery = filteredQuery.eq('assigned_to', filters.assignedTo);
  }
  
  // Apply recurring filter
  if (filters?.isRecurring !== undefined) {
    filteredQuery = filteredQuery.eq('is_recurring', filters.isRecurring);
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
  
  // Apply search filter (title, description, notes)
  if (filters?.search) {
    filteredQuery = filteredQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
  }
  
  // Apply sort
  const sortField = filters?.sortBy || 'due_date';
  const sortOrder = filters?.sortOrder || 'asc';
  filteredQuery = filteredQuery.order(sortField, { ascending: sortOrder === 'asc' });
  
  // Apply limit
  if (filters?.limit) {
    filteredQuery = filteredQuery.limit(filters.limit);
  }
  
  return filteredQuery;
};

// Get all reminders with optional filters
export const getAllReminders = async (filters?: ReminderFilters): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
      .from("service_reminders")
      .select(`
        *,
        categories:category_id(*),
        profiles:assigned_to(first_name, last_name, full_name),
        tags:service_reminder_tags(tag_id(*))
      `);
      
    query = applyReminderFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(item => {
      // Process nested joins for tags
      const tags = item.tags ? 
        item.tags.map((tagRelation: any) => mapTagFromDb(tagRelation.tag_id)) : 
        [];
      
      return mapReminderFromDb({
        ...item,
        tags
      });
    });
  } catch (error) {
    console.error("Error fetching all reminders:", error);
    throw error;
  }
};

// Get reminders for a specific customer with optional filters
export const getCustomerReminders = async (customerId: string, filters?: ReminderFilters): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
      .from("service_reminders")
      .select(`
        *,
        categories:category_id(*),
        profiles:assigned_to(first_name, last_name, full_name),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('customer_id', customerId);
      
    query = applyReminderFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(item => {
      // Process nested joins for tags
      const tags = item.tags ? 
        item.tags.map((tagRelation: any) => mapTagFromDb(tagRelation.tag_id)) : 
        [];
      
      return mapReminderFromDb({
        ...item,
        tags
      });
    });
  } catch (error) {
    console.error(`Error fetching customer reminders for ${customerId}:`, error);
    throw error;
  }
};

// Get reminders for a specific vehicle with optional filters
export const getVehicleReminders = async (vehicleId: string, filters?: ReminderFilters): Promise<ServiceReminder[]> => {
  try {
    let query = supabase
      .from("service_reminders")
      .select(`
        *,
        categories:category_id(*),
        profiles:assigned_to(first_name, last_name, full_name),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('vehicle_id', vehicleId);
      
    query = applyReminderFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(item => {
      // Process nested joins for tags
      const tags = item.tags ? 
        item.tags.map((tagRelation: any) => mapTagFromDb(tagRelation.tag_id)) : 
        [];
      
      return mapReminderFromDb({
        ...item,
        tags
      });
    });
  } catch (error) {
    console.error(`Error fetching vehicle reminders for ${vehicleId}:`, error);
    throw error;
  }
};

// Get upcoming reminders (due in the next X days)
export const getUpcomingReminders = async (days: number = 7, filters?: ReminderFilters): Promise<ServiceReminder[]> => {
  try {
    // Calculate target date range
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);
    
    const todayStr = today.toISOString().split('T')[0];
    const targetDateStr = targetDate.toISOString().split('T')[0];

    let query = supabase
      .from("service_reminders")
      .select(`
        *,
        categories:category_id(*),
        profiles:assigned_to(first_name, last_name, full_name),
        tags:service_reminder_tags(tag_id(*))
      `)
      .gte("due_date", todayStr)
      .lte("due_date", targetDateStr)
      .in("status", ["pending", "sent"]);
      
    query = applyReminderFilters(query, filters);
    
    const { data, error } = await query;

    if (error) throw error;
    
    return (data || []).map(item => {
      // Process nested joins for tags
      const tags = item.tags ? 
        item.tags.map((tagRelation: any) => mapTagFromDb(tagRelation.tag_id)) : 
        [];
      
      return mapReminderFromDb({
        ...item,
        tags
      });
    });
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error);
    throw error;
  }
};

// Get all reminder categories
export const getReminderCategories = async (): Promise<ReminderCategory[]> => {
  try {
    const { data, error } = await supabase
      .from("reminder_categories")
      .select("*")
      .eq("is_active", true)
      .order("name");
    
    if (error) throw error;
    
    return (data || []).map(mapCategoryFromDb);
  } catch (error) {
    console.error("Error fetching reminder categories:", error);
    throw error;
  }
};

// Get all reminder tags
export const getReminderTags = async (): Promise<ReminderTag[]> => {
  try {
    const { data, error } = await supabase
      .from("reminder_tags")
      .select("*")
      .order("name");
    
    if (error) throw error;
    
    return (data || []).map(mapTagFromDb);
  } catch (error) {
    console.error("Error fetching reminder tags:", error);
    throw error;
  }
};

// Get all reminder templates
export const getReminderTemplates = async (): Promise<ReminderTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from("reminder_templates")
      .select(`
        *,
        categories:category_id(*)
      `)
      .order("title");
    
    if (error) throw error;
    
    return (data || []).map(mapTemplateFromDb);
  } catch (error) {
    console.error("Error fetching reminder templates:", error);
    throw error;
  }
};

// Get a specific reminder template by ID
export const getReminderTemplateById = async (templateId: string): Promise<ReminderTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from("reminder_templates")
      .select(`
        *,
        categories:category_id(*)
      `)
      .eq("id", templateId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return mapTemplateFromDb(data);
  } catch (error) {
    console.error(`Error fetching reminder template ${templateId}:`, error);
    throw error;
  }
};

// Get tags for a specific reminder
export const getReminderTags = async (reminderId: string): Promise<ReminderTag[]> => {
  try {
    const { data, error } = await supabase
      .from("service_reminder_tags")
      .select(`
        tag_id(*)
      `)
      .eq("reminder_id", reminderId);
    
    if (error) throw error;
    
    return (data || []).map((item: any) => mapTagFromDb(item.tag_id));
  } catch (error) {
    console.error(`Error fetching tags for reminder ${reminderId}:`, error);
    throw error;
  }
};
