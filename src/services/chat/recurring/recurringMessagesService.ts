
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns';

interface RecurringMessage {
  id: string;
  room_id: string;
  content: string;
  created_by: string;
  created_by_name: string;
  start_date: string;
  recurrence_pattern: string; // daily, weekly, monthly
  recurrence_interval: number; // 1 = every day/week/month, 2 = every other, etc.
  is_active: boolean;
  days_of_week?: number[]; // 0 = Sunday, 1 = Monday, etc.
  last_sent_at?: string;
  end_date?: string;
}

/**
 * Create a new recurring message
 */
export const createRecurringMessage = async (
  roomId: string,
  content: string,
  createdBy: string,
  createdByName: string,
  startDate: Date,
  recurrencePattern: string,
  recurrenceInterval: number,
  daysOfWeek?: number[],
  endDate?: Date
): Promise<RecurringMessage> => {
  const { data, error } = await supabase
    .from('chat_recurring_messages')
    .insert({
      room_id: roomId,
      content: content,
      created_by: createdBy,
      created_by_name: createdByName,
      start_date: format(startDate, 'yyyy-MM-dd'),
      recurrence_pattern: recurrencePattern,
      recurrence_interval: recurrenceInterval,
      is_active: true,
      days_of_week: daysOfWeek,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update a recurring message
 */
export const updateRecurringMessage = async (
  id: string,
  updates: Partial<RecurringMessage>
): Promise<RecurringMessage> => {
  const { data, error } = await supabase
    .from('chat_recurring_messages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete a recurring message
 */
export const deleteRecurringMessage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_recurring_messages')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Get all recurring messages for a room
 */
export const getRoomRecurringMessages = async (roomId: string): Promise<RecurringMessage[]> => {
  const { data, error } = await supabase
    .from('chat_recurring_messages')
    .select('*')
    .eq('room_id', roomId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data || [];
};

/**
 * Process recurring messages that need to be sent today
 */
export const processRecurringMessages = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // Get active recurring messages that should be processed
    const { data: messages, error } = await supabase
      .from('chat_recurring_messages')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', todayStr)
      .or(`end_date.is.null,end_date.gte.${todayStr}`);
    
    if (error) throw error;
    
    if (!messages || messages.length === 0) {
      return 0;
    }
    
    let sentCount = 0;
    
    for (const message of messages) {
      try {
        const shouldSendToday = checkIfShouldSendToday(message, today);
        
        if (shouldSendToday) {
          // Send the message
          await supabase
            .from('chat_messages')
            .insert({
              room_id: message.room_id,
              sender_id: message.created_by,
              sender_name: message.created_by_name,
              content: message.content,
              message_type: 'text',
              metadata: {
                is_recurring: true,
                recurring_message_id: message.id
              }
            });
          
          // Update last_sent_at
          await supabase
            .from('chat_recurring_messages')
            .update({ last_sent_at: new Date().toISOString() })
            .eq('id', message.id);
          
          sentCount++;
        }
      } catch (err) {
        console.error(`Error processing recurring message ${message.id}:`, err);
      }
    }
    
    return sentCount;
  } catch (error) {
    console.error('Error processing recurring messages:', error);
    return 0;
  }
};

/**
 * Check if a recurring message should be sent today
 */
const checkIfShouldSendToday = (message: RecurringMessage, today: Date): boolean => {
  // If message was already sent today, don't send again
  if (message.last_sent_at) {
    const lastSent = parseISO(message.last_sent_at);
    if (lastSent.getDate() === today.getDate() && 
        lastSent.getMonth() === today.getMonth() && 
        lastSent.getFullYear() === today.getFullYear()) {
      return false;
    }
  }
  
  const startDate = parseISO(message.start_date);
  
  // Check based on recurrence pattern
  switch (message.recurrence_pattern) {
    case 'daily': {
      // Calculate days since start
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      // Send if days since start is divisible by interval
      return diffDays % message.recurrence_interval === 0;
    }
    
    case 'weekly': {
      // Check if today's day of week is in the specified days
      if (message.days_of_week && message.days_of_week.length > 0) {
        const todayDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        if (!message.days_of_week.includes(todayDayOfWeek)) {
          return false;
        }
      }
      
      // Calculate weeks since start
      const diffTime = today.getTime() - startDate.getTime();
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      // Send if weeks since start is divisible by interval
      return diffWeeks % message.recurrence_interval === 0;
    }
    
    case 'monthly': {
      // Check if it's the same day of month as start date
      if (today.getDate() !== startDate.getDate()) {
        return false;
      }
      
      // Calculate months since start
      const monthDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                         today.getMonth() - startDate.getMonth();
      
      // Send if months since start is divisible by interval
      return monthDiff % message.recurrence_interval === 0;
    }
    
    default:
      return false;
  }
};

/**
 * Calculate the next occurrence date for a recurring message
 */
export const getNextOccurrence = (message: RecurringMessage): Date | null => {
  if (!message.is_active) {
    return null;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = parseISO(message.start_date);
  if (startDate > today) {
    return startDate; // Hasn't started yet
  }
  
  let lastSent: Date;
  if (message.last_sent_at) {
    lastSent = parseISO(message.last_sent_at);
    lastSent.setHours(0, 0, 0, 0);
  } else {
    lastSent = new Date(startDate);
    lastSent.setDate(lastSent.getDate() - 1); // Day before start
  }
  
  let nextDate: Date;
  
  switch (message.recurrence_pattern) {
    case 'daily':
      nextDate = addDays(lastSent, message.recurrence_interval);
      break;
      
    case 'weekly':
      nextDate = addWeeks(lastSent, message.recurrence_interval);
      
      // If days of week are specified, find the next applicable day
      if (message.days_of_week && message.days_of_week.length > 0) {
        let daysToAdd = 0;
        let found = false;
        
        // Check up to 7 days to find the next applicable day
        for (let i = 1; i <= 7; i++) {
          const checkDate = addDays(nextDate, daysToAdd);
          if (message.days_of_week.includes(checkDate.getDay())) {
            nextDate = checkDate;
            found = true;
            break;
          }
          daysToAdd++;
        }
        
        if (!found) {
          return null; // No valid day found
        }
      }
      break;
      
    case 'monthly':
      nextDate = addMonths(lastSent, message.recurrence_interval);
      
      // Adjust to match the same day of month as start date
      nextDate.setDate(startDate.getDate());
      break;
      
    default:
      return null;
  }
  
  // Check if beyond end date
  if (message.end_date) {
    const endDate = parseISO(message.end_date);
    if (nextDate > endDate) {
      return null;
    }
  }
  
  return nextDate;
};
