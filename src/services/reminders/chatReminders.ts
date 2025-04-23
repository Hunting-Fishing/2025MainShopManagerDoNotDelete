
import { supabase } from '@/integrations/supabase/client';
import { ServiceReminder } from '@/types/reminder';
import { mapReminderFromDb } from './reminderMapper';

/**
 * Get all service reminders associated with chat messages
 */
export const getChatReminders = async (): Promise<ServiceReminder[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        metadata
      `)
      .not('metadata->reminder_id', 'is', null);
    
    if (error) throw error;
    
    // For messages with reminder IDs, fetch the actual reminders
    if (!data || data.length === 0) return [];
    
    const reminderIds = data
      .map(item => {
        if (item.metadata && typeof item.metadata === 'object') {
          return (item.metadata as Record<string, any>).reminder_id;
        }
        return null;
      })
      .filter(Boolean);
    
    if (reminderIds.length === 0) return [];
    
    const { data: reminderData, error: reminderError } = await supabase
      .from('service_reminders')
      .select('*')
      .in('id', reminderIds);
      
    if (reminderError) throw reminderError;
    
    // Map the reminders to the expected format
    return (reminderData || []).map(mapReminderFromDb);
  } catch (error) {
    console.error('Error getting chat reminders:', error);
    return [];
  }
};

/**
 * Get all pending reminders that should trigger new chat messages
 */
export const getPendingReminderMessages = async (): Promise<ServiceReminder[]> => {
  try {
    // Get current date
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('service_reminders')
      .select(`
        *
      `)
      .eq('status', 'pending')
      .lte('due_date', today)
      .eq('notification_sent', false);
    
    if (error) throw error;
    
    return (data || []).map(mapReminderFromDb);
  } catch (error) {
    console.error('Error getting pending reminder messages:', error);
    return [];
  }
};

/**
 * Mark a reminder as having triggered a chat message
 */
export const markReminderNotifiedInChat = async (reminderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_reminders')
      .update({
        notification_sent: true,
        notification_date: new Date().toISOString()
      })
      .eq('id', reminderId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error marking reminder ${reminderId} as notified in chat:`, error);
    return false;
  }
};

/**
 * Process all pending reminders and create chat messages for them
 */
export const processReminderMessages = async (
  createChatMessageFromReminder: (roomId: string, reminderId: string) => Promise<any>
): Promise<number> => {
  try {
    // Get all pending reminders
    const pendingReminders = await getPendingReminderMessages();
    let processedCount = 0;
    
    // Process each reminder
    for (const reminder of pendingReminders) {
      try {
        // If the reminder is associated with a customer, try to find a direct chat room
        if (reminder.customerId) {
          // Find or create a room for the reminder (assuming workerUserId is the one who needs to be reminded)
          const roomId = await findOrCreateReminderChatRoom(reminder);
          
          if (roomId) {
            // Create the chat message
            await createChatMessageFromReminder(roomId, reminder.id);
            
            // Mark the reminder as notified
            await markReminderNotifiedInChat(reminder.id);
            
            processedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        // Continue with the next reminder
      }
    }
    
    return processedCount;
  } catch (error) {
    console.error('Error processing reminder messages:', error);
    return 0;
  }
};

/**
 * Find or create a chat room for a reminder
 */
const findOrCreateReminderChatRoom = async (reminder: ServiceReminder): Promise<string | null> => {
  try {
    // First try to find a room shared between the assigned user and the customer
    if (reminder.assignedTo) {
      // Look for direct rooms that include both the assigned user and are associated with the customer
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('type', 'direct')
        .contains('metadata', { customer_id: reminder.customerId });
        
      if (!error && rooms && rooms.length > 0) {
        // Return ID of the first applicable room
        return rooms[0].id;
      }
    }
    
    // If no applicable room found or there's no assigned user, create a system room
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: 'Reminder Notifications',
        type: 'system', 
        metadata: {
          is_reminder_room: true,
          customer_id: reminder.customerId
        }
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error finding or creating reminder chat room:', error);
    return null;
  }
};
