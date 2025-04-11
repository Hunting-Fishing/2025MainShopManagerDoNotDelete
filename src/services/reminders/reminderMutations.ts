import { supabase } from "@/integrations/supabase/client";
import { ServiceReminder, CreateReminderParams, ReminderStatus, ReminderTag } from "@/types/reminder";
import { mapReminderToDb, mapReminderFromDb } from "./reminderMapper";

/**
 * Create a new reminder
 * @param reminderData The reminder data to create
 */
export const createReminder = async (reminderData: CreateReminderParams): Promise<ServiceReminder> => {
  try {
    const dbData = mapReminderToDb(reminderData);
    
    // Add created_by field if user info is available
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      dbData.created_by = userData.user.id || 'unknown';
    }
    
    // Insert the reminder
    const { data: newReminder, error } = await supabase
      .from('service_reminders')
      .insert(dbData)
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .single();
    
    if (error) throw error;
    
    // If tags were specified, create the tag relationships
    if (reminderData.tagIds && reminderData.tagIds.length > 0) {
      const tagRelations = reminderData.tagIds.map(tagId => ({
        reminder_id: newReminder.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('service_reminder_tags')
        .insert(tagRelations);
      
      if (tagError) {
        console.error("Failed to add tags to reminder:", tagError);
        // Continue anyway, the reminder is created
      }
    }
    
    return mapReminderFromDb(newReminder);
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }
};

/**
 * Update a reminder's status
 * @param reminderId The ID of the reminder to update
 * @param status The new status
 * @param notes Optional notes to add
 */
export const updateReminderStatus = async (
  reminderId: string, 
  status: ReminderStatus,
  notes?: string
): Promise<ServiceReminder> => {
  try {
    const updateData: any = { status };
    
    // Add completed information if the status is completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      
      // Add completed_by if user info is available
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        updateData.completed_by = userData.user.id || 'unknown';
      }
    }
    
    // Add notes if provided
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    // Update the reminder
    const { data, error } = await supabase
      .from('service_reminders')
      .update(updateData)
      .eq('id', reminderId)
      .select(`
        *,
        categories:category_id(*),
        tags:service_reminder_tags(tag_id(*))
      `)
      .single();
    
    if (error) throw error;
    
    return mapReminderFromDb(data);
  } catch (error) {
    console.error("Error updating reminder status:", error);
    throw error;
  }
};

/**
 * Delete a reminder
 * @param reminderId The ID of the reminder to delete
 */
export const deleteReminder = async (reminderId: string): Promise<boolean> => {
  try {
    // Delete the reminder
    const { error } = await supabase
      .from('service_reminders')
      .delete()
      .eq('id', reminderId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

/**
 * Create a new reminder tag
 * @param tagName Name of the tag to create
 * @param color Optional color for the tag
 */
export const createReminderTag = async (tagName: string, color?: string): Promise<ReminderTag> => {
  try {
    const tagData = {
      name: tagName,
      color: color || '#' + Math.floor(Math.random()*16777215).toString(16) // Generate random color if not provided
    };
    
    const { data, error } = await supabase
      .from('reminder_tags')
      .insert(tagData)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      color: data.color
    };
  } catch (error) {
    console.error("Error creating reminder tag:", error);
    throw error;
  }
};
