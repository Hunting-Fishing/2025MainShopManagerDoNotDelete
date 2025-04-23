
import { useState, useCallback } from 'react';
import { createReminder } from '@/services/reminderService';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useAuthUser } from '@/hooks/useAuthUser';
import { 
  ReminderType, 
  ReminderPriority, 
  RecurrenceUnit
} from '@/types/reminder';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';

interface CreateReminderFromMessageParams {
  messageId: string;
  dueDate: Date;
  title: string;
  description: string;
  type: ReminderType;
  priority: ReminderPriority;
  isRecurring: boolean;
  recurrenceInterval?: number;
  recurrenceUnit?: string;
}

export const useChatReminders = (customerId?: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const { userId, userName } = useAuthUser();
  
  const createReminderFromMessage = useCallback(async (params: CreateReminderFromMessageParams) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create reminders",
        variant: "destructive"
      });
      return;
    }
    
    if (!customerId) {
      toast({
        title: "Error",
        description: "No customer associated with this chat",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const formattedDate = format(params.dueDate, "yyyy-MM-dd");
      
      // Create the reminder
      const reminder = await createReminder({
        customerId,
        type: params.type,
        title: params.title,
        description: params.description,
        dueDate: formattedDate,
        notes: `Created from chat message ID: ${params.messageId}`,
        priority: params.priority,
        assignedTo: userId,
        isRecurring: params.isRecurring,
        recurrenceInterval: params.recurrenceInterval,
        recurrenceUnit: params.recurrenceUnit as RecurrenceUnit,
      });
      
      // Update the chat message with reminder metadata
      await supabase
        .from('chat_messages')
        .update({
          metadata: {
            reminder_id: reminder.id,
            reminder_due_date: formattedDate,
            reminder_type: params.type,
            reminder_priority: params.priority
          }
        })
        .eq('id', params.messageId);
      
      return reminder;
    } catch (error) {
      console.error("Error creating reminder from message:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [userId, userName, customerId]);
  
  const createChatMessageFromReminder = useCallback(async (roomId: string, reminderId: string) => {
    try {
      if (!userId || !userName) return null;
      
      // Get the reminder details
      const { data: reminder, error } = await supabase
        .from('service_reminders')
        .select('*')
        .eq('id', reminderId)
        .single();
      
      if (error || !reminder) {
        throw new Error(error?.message || 'Reminder not found');
      }
      
      // Create a system message in the chat room
      const { data: message, error: msgError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: userId,
          sender_name: userName,
          content: `🔔 REMINDER: ${reminder.title}\n\n${reminder.description || ''}\nDue date: ${reminder.due_date}`,
          message_type: 'system',
          metadata: {
            reminder_id: reminder.id,
            reminder_due_date: reminder.due_date,
            reminder_type: reminder.type,
            reminder_priority: reminder.priority
          }
        })
        .select('*')
        .single();
      
      if (msgError) {
        throw msgError;
      }
      
      return message as ChatMessage;
    } catch (error) {
      console.error("Error creating chat message from reminder:", error);
      throw error;
    }
  }, [userId, userName]);
  
  return {
    createReminderFromMessage,
    createChatMessageFromReminder,
    isCreating
  };
};
