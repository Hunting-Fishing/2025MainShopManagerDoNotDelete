import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder, ReminderCategory, ReminderTag, ReminderTemplate } from "@/types/reminder";
import { DateRange } from "react-day-picker";
import { mapReminderFromDb, mapCategoryFromDb, mapTemplateFromDb } from "./reminderMapper";

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
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Get all reminders with optional filters
export const getAllReminders = async (filters: ReminderFilters = {}): Promise<ServiceReminder[]> => {
  try {
    const {
      status,
      priority,
      categoryId,
      assignedTo,
      isRecurring,
      dateRange,
      tagIds,
      search,
      sortBy = 'due_date',
      sortOrder = 'asc',
      limit
    } = filters;

    // Start building the query
    let query = supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    
    if (isRecurring !== undefined) {
      query = query.eq('is_recurring', isRecurring);
    }
    
    // Date range filter
    if (dateRange?.from) {
      query = query.gte('due_date', dateRange.from.toISOString().split('T')[0]);
      
      if (dateRange.to) {
        query = query.lte('due_date', dateRange.to.toISOString().split('T')[0]);
      }
    }
    
    // Tag filtering - more complex, requires custom logic
    if (tagIds && tagIds.length > 0) {
      // This is a simplistic approach that works for at least one tag match
      const tagCondition = tagIds.map(tagId => `tag_id.eq.${tagId}`).join(',');
      query = query.filter('tags.tag_id.id', 'in', `(${tagIds.join(',')})`);
    }
    
    // Search functionality
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply sorting
    if (sortBy) {
      // Map frontend field names to database column names
      const dbFieldMap: Record<string, string> = {
        'dueDate': 'due_date',
        'createdAt': 'created_at',
        'title': 'title',
        'status': 'status',
        'priority': 'priority'
      };
      
      const dbField = dbFieldMap[sortBy] || sortBy;
      query = query.order(dbField, { ascending: sortOrder === 'asc' });
    }
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching all reminders:", error);
      throw error;
    }

    // Transform data to frontend format
    return data.map((item: any) => mapReminderFromDb(item));
  } catch (error) {
    console.error("Error fetching all reminders:", error);
    throw error;
  }
};

// Get customer reminders with optional filters
export const getCustomerReminders = async (
  customerId: string, 
  filters: ReminderFilters = {}
): Promise<ServiceReminder[]> => {
  try {
    // Clone the filters and add customer ID
    const customerFilters = { ...filters, customerId };
    const {
      status,
      priority,
      categoryId,
      assignedTo,
      isRecurring,
      dateRange,
      tagIds,
      search,
      sortBy = 'due_date',
      sortOrder = 'asc',
      limit
    } = filters;
    const query = supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('customer_id', customerId);
      
      if (status) {
        query.eq('status', status);
      }
      if (priority) {
        query.eq('priority', priority);
      }
      if (categoryId) {
        query.eq('category_id', categoryId);
      }
      if (assignedTo) {
        query.eq('assigned_to', assignedTo);
      }
      if (isRecurring !== undefined) {
        query.eq('is_recurring', isRecurring);
      }
    
      if (dateRange?.from) {
        query.gte('due_date', dateRange.from.toISOString().split('T')[0]);
        if (dateRange.to) {
          query.lte('due_date', dateRange.to.toISOString().split('T')[0]);
        }
      }
      if (tagIds && tagIds.length > 0) {
        const tagCondition = tagIds.map(tagId => `tag_id.eq.${tagId}`).join(',');
        query.filter('tags.tag_id.id', 'in', `(${tagIds.join(',')})`);
      }
      if (search) {
        query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (sortBy) {
        const dbFieldMap: Record<string, string> = {
          'dueDate': 'due_date',
          'createdAt': 'created_at',
          'title': 'title',
          'status': 'status',
          'priority': 'priority'
        };
        const dbField = dbFieldMap[sortBy] || sortBy;
        query.order(dbField, { ascending: sortOrder === 'asc' });
      }
      if (limit) {
        query.limit(limit);
      }
    
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching reminders for customer ${customerId}:`, error);
      throw error;
    }

    // Transform data to frontend format
    return data.map((item: any) => mapReminderFromDb(item));
  } catch (error) {
    console.error(`Error fetching reminders for customer ${customerId}:`, error);
    throw error;
  }
};

// Get vehicle reminders
export const getVehicleReminders = async (
  vehicleId: string,
  filters: ReminderFilters = {}
): Promise<ServiceReminder[]> => {
  try {
    const {
      status,
      priority,
      categoryId,
      assignedTo,
      isRecurring,
      dateRange,
      tagIds,
      search,
      sortBy = 'due_date',
      sortOrder = 'asc',
      limit
    } = filters;
    const query = supabase
      .from('service_reminders')
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .eq('vehicle_id', vehicleId);
      
      if (status) {
        query.eq('status', status);
      }
      if (priority) {
        query.eq('priority', priority);
      }
      if (categoryId) {
        query.eq('category_id', categoryId);
      }
      if (assignedTo) {
        query.eq('assigned_to', assignedTo);
      }
      if (isRecurring !== undefined) {
        query.eq('is_recurring', isRecurring);
      }
    
      if (dateRange?.from) {
        query.gte('due_date', dateRange.from.toISOString().split('T')[0]);
        if (dateRange.to) {
          query.lte('due_date', dateRange.to.toISOString().split('T')[0]);
        }
      }
      if (tagIds && tagIds.length > 0) {
        const tagCondition = tagIds.map(tagId => `tag_id.eq.${tagId}`).join(',');
        query.filter('tags.tag_id.id', 'in', `(${tagIds.join(',')})`);
      }
      if (search) {
        query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (sortBy) {
        const dbFieldMap: Record<string, string> = {
          'dueDate': 'due_date',
          'createdAt': 'created_at',
          'title': 'title',
          'status': 'status',
          'priority': 'priority'
        };
        const dbField = dbFieldMap[sortBy] || sortBy;
        query.order(dbField, { ascending: sortOrder === 'asc' });
      }
      if (limit) {
        query.limit(limit);
      }
    
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching reminders for vehicle ${vehicleId}:`, error);
      throw error;
    }

    // Transform data to frontend format
    return data.map((item: any) => mapReminderFromDb(item));
  } catch (error) {
    console.error(`Error fetching reminders for vehicle ${vehicleId}:`, error);
    throw error;
  }
};

// Get upcoming reminders
export const getUpcomingReminders = async (
  limit: number = 5,
  filters: ReminderFilters = {}
): Promise<ServiceReminder[]> => {
  try {
    // Set default status to pending for upcoming reminders
    const upcomingFilters = { 
      ...filters,
      status: filters.status || 'pending',
      sortBy: 'due_date',
      sortOrder: 'asc' as 'asc',
      limit
    };
    
    return getAllReminders(upcomingFilters);
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error);
    throw error;
  }
};

// Get reminder categories
export const getReminderCategories = async (): Promise<ReminderCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching reminder categories:", error);
      throw error;
    }

    return data.map((category: any) => mapCategoryFromDb(category));
  } catch (error) {
    console.error("Error fetching reminder categories:", error);
    throw error;
  }
};

// Get reminder tags
export const getReminderTags = async (): Promise<ReminderTag[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_tags')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching reminder tags:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching reminder tags:", error);
    throw error;
  }
};

// Get reminder templates with optional filters
export const getReminderTemplates = async (): Promise<ReminderTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('reminder_templates')
      .select(`
        *,
        categories:category_id(*)
      `)
      .order('title');

    if (error) {
      console.error("Error fetching reminder templates:", error);
      throw error;
    }

    return data.map((template: any) => mapTemplateFromDb(template));
  } catch (error) {
    console.error("Error fetching reminder templates:", error);
    throw error;
  }
};
