
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { transformDatabaseMessage } from './types';

/**
 * Get messages for a chat room
 */
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .is('thread_parent_id', null) // Only get main messages, not thread replies
    .order('created_at', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return (data || []).map(transformDatabaseMessage);
};

/**
 * Get thread messages (replies to a parent message)
 */
export const getThreadMessages = async (parentMessageId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_parent_id', parentMessageId)
    .order('created_at', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return (data || []).map(transformDatabaseMessage);
};
