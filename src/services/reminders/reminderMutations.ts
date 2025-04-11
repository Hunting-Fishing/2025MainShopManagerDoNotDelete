
import { supabase } from "@/integrations/supabase/client";
import { 
  ServiceReminder, 
  ReminderStatus, 
  CreateReminderParams, 
  ReminderTemplate, 
  CreateReminderTemplateParams, 
  ReminderTag 
} from "@/types/reminder";
import { mapReminderFromDb, mapReminderToDb, mapTemplateFromDb, mapTemplateToDb } from "./reminderMapper";

// Create a new reminder
export const createReminder = async (params: CreateReminderParams): Promise<ServiceReminder> => {
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
    notes: params.notes || null,
    
    // New advanced properties
    priority: params.priority || "medium",
    category_id: params.categoryId || null,
    assigned_to: params.assignedTo || null,
    template_id: params.templateId || null,
    is_recurring: params.isRecurring || false,
    recurrence_interval: params.recurrenceInterval || null,
    recurrence_unit: params.recurrenceUnit || null
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

  const newReminder = mapReminderFromDb(data);
  
  // If tag IDs were provided, create tag associations
  if (params.tagIds && params.tagIds.length > 0) {
    const tagAssociations = params.tagIds.map(tagId => ({
      reminder_id: newReminder.id,
      tag_id: tagId
    }));
    
    const { error: tagsError } = await supabase
      .from("service_reminder_tags")
      .insert(tagAssociations);
    
    if (tagsError) {
      console.error("Error associating tags with reminder:", tagsError);
    }
  }

  return newReminder;
};

// Create a reminder from a template
export const createReminderFromTemplate = async (
  templateId: string,
  customerId: string,
  vehicleId?: string,
  dueDate?: string
): Promise<ServiceReminder> => {
  try {
    // Get the template details
    const { data: template, error: templateError } = await supabase
      .from("reminder_templates")
      .select("*")
      .eq("id", templateId)
      .single();
    
    if (templateError) throw templateError;
    
    // Calculate due date if not provided
    const calculatedDueDate = dueDate || (() => {
      const date = new Date();
      date.setDate(date.getDate() + (template.default_days_until_due || 30));
      return date.toISOString().split('T')[0];
    })();
    
    // Create the reminder
    const params: CreateReminderParams = {
      customerId,
      vehicleId,
      title: template.title,
      description: template.description || "",
      type: "service", // Default type
      dueDate: calculatedDueDate,
      priority: template.priority,
      categoryId: template.category_id,
      templateId,
      isRecurring: template.is_recurring,
      recurrenceInterval: template.recurrence_interval,
      recurrenceUnit: template.recurrence_unit
    };
    
    return await createReminder(params);
  } catch (error) {
    console.error("Error creating reminder from template:", error);
    throw error;
  }
};

// Update reminder status
export const updateReminderStatus = async (
  reminderId: string, 
  status: ReminderStatus,
  notes?: string
): Promise<ServiceReminder> => {
  const currentUser = "current-user"; // In a real app, get this from auth context
  
  const updateData: any = {
    status: status
  };
  
  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
    updateData.completed_by = currentUser;
  }
  
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const { data, error } = await supabase
    .from("service_reminders")
    .update(updateData)
    .eq("id", reminderId)
    .select(`
      *,
      categories:category_id(*),
      profiles:assigned_to(first_name, last_name, full_name),
      tags:service_reminder_tags(tag_id(*))
    `)
    .single();

  if (error) {
    console.error("Error updating reminder status:", error);
    throw error;
  }

  // Process nested joins for tags
  const tags = data.tags ? 
    data.tags.map((tagRelation: any) => mapTagFromDb(tagRelation.tag_id)) : 
    [];
  
  return mapReminderFromDb({
    ...data,
    tags
  });
};

// Update reminder details
export const updateReminder = async (
  reminderId: string,
  reminderData: Partial<ServiceReminder>
): Promise<ServiceReminder> => {
  try {
    const updateData = mapReminderToDb(reminderData);
    
    const { data, error } = await supabase
      .from("service_reminders")
      .update(updateData)
      .eq("id", reminderId)
      .select(`
        *,
        categories:category_id(*),
        profiles:assigned_to(first_name, last_name, full_name),
        tags:service_reminder_tags(tag_id(*))
      `)
      .single();
    
    if (error) throw error;
    
    // Process nested joins for tags
    const tags = data.tags ? 
      data.tags.map((tagRelation: any) => mapTagFromDb(tagRelation.tag_id)) : 
      [];
    
    return mapReminderFromDb({
      ...data,
      tags
    });
  } catch (error) {
    console.error(`Error updating reminder ${reminderId}:`, error);
    throw error;
  }
};

// Delete a reminder
export const deleteReminder = async (reminderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("service_reminders")
      .delete()
      .eq("id", reminderId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting reminder ${reminderId}:`, error);
    throw error;
  }
};

// Create a new reminder template
export const createReminderTemplate = async (params: CreateReminderTemplateParams): Promise<ReminderTemplate> => {
  try {
    const currentUser = "current-user"; // In a real app, get this from auth context
    
    const templateData = {
      title: params.title,
      description: params.description,
      category_id: params.categoryId,
      priority: params.priority || "medium",
      default_days_until_due: params.defaultDaysUntilDue || 30,
      notification_days_before: params.notificationDaysBefore || 3,
      is_recurring: params.isRecurring || false,
      recurrence_interval: params.recurrenceInterval,
      recurrence_unit: params.recurrenceUnit,
      created_by: currentUser
    };
    
    const { data, error } = await supabase
      .from("reminder_templates")
      .insert(templateData)
      .select(`
        *,
        categories:category_id(*)
      `)
      .single();
    
    if (error) throw error;
    
    return mapTemplateFromDb(data);
  } catch (error) {
    console.error("Error creating reminder template:", error);
    throw error;
  }
};

// Update a reminder template
export const updateReminderTemplate = async (
  templateId: string,
  templateData: Partial<ReminderTemplate>
): Promise<ReminderTemplate> => {
  try {
    const updateData = mapTemplateToDb(templateData);
    
    const { data, error } = await supabase
      .from("reminder_templates")
      .update(updateData)
      .eq("id", templateId)
      .select(`
        *,
        categories:category_id(*)
      `)
      .single();
    
    if (error) throw error;
    
    return mapTemplateFromDb(data);
  } catch (error) {
    console.error(`Error updating reminder template ${templateId}:`, error);
    throw error;
  }
};

// Delete a reminder template
export const deleteReminderTemplate = async (templateId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("reminder_templates")
      .delete()
      .eq("id", templateId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting reminder template ${templateId}:`, error);
    throw error;
  }
};

// Create a new reminder tag
export const createReminderTag = async (name: string, color?: string): Promise<ReminderTag> => {
  try {
    const { data, error } = await supabase
      .from("reminder_tags")
      .insert({
        name,
        color: color || getRandomColor()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { id: data.id, name: data.name, color: data.color };
  } catch (error) {
    console.error("Error creating reminder tag:", error);
    throw error;
  }
};

// Update reminder tags
export const updateReminderTags = async (reminderId: string, tagIds: string[]): Promise<void> => {
  try {
    // First delete all existing tag associations
    const { error: deleteError } = await supabase
      .from("service_reminder_tags")
      .delete()
      .eq("reminder_id", reminderId);
    
    if (deleteError) throw deleteError;
    
    // Then insert the new associations
    if (tagIds.length > 0) {
      const tagAssociations = tagIds.map(tagId => ({
        reminder_id: reminderId,
        tag_id: tagId
      }));
      
      const { error: insertError } = await supabase
        .from("service_reminder_tags")
        .insert(tagAssociations);
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error(`Error updating tags for reminder ${reminderId}:`, error);
    throw error;
  }
};

// Helper function to generate a random color
const getRandomColor = (): string => {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#F97316', // orange
    '#06B6D4', // cyan
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
