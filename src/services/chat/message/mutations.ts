
import { supabase } from '@/integrations/supabase/client';
import { MessageSendParams, MessageEditParams, MessageFlagParams, validateMessageType } from './types';
import { transformDatabaseMessage } from './types';
import { ChatMessage } from '@/types/chat';

/**
 * Send a new message
 */
export const sendChatMessage = async (params: MessageSendParams): Promise<ChatMessage> => {
  const { roomId, senderId, senderName, content, messageType = 'text', threadParentId } = params;
  
  // Validate message type
  validateMessageType(messageType);
  
  // If this is a thread reply, update the parent message's thread count
  if (threadParentId) {
    const { data: parentMessage, error: parentError } = await supabase
      .from('chat_messages')
      .select('thread_count')
      .eq('id', threadParentId)
      .single();
      
    if (!parentError && parentMessage) {
      const newCount = (parentMessage.thread_count || 0) + 1;
      
      await supabase
        .from('chat_messages')
        .update({ thread_count: newCount })
        .eq('id', threadParentId);
    }
  }
  
  // Insert the new message
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: senderId,
      sender_name: senderName,
      content,
      message_type: messageType,
      thread_parent_id: threadParentId || null
    })
    .select('*')
    .single();
    
  if (error) {
    throw error;
  }
  
  // Update the chat room's updated_at timestamp
  await supabase
    .from('chat_rooms')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', roomId);
    
  return transformDatabaseMessage(data);
};

/**
 * Edit a message
 */
export const editChatMessage = async (messageId: string, content: string): Promise<ChatMessage> => {
  // First, get the original message to preserve it
  const { data: originalMessage, error: getError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('id', messageId)
    .single();
    
  if (getError) {
    throw getError;
  }
  
  // Now update the message
  const { data, error } = await supabase
    .from('chat_messages')
    .update({
      content,
      is_edited: true,
      edited_at: new Date().toISOString(),
      original_content: originalMessage.original_content || originalMessage.content // Keep original if already edited
    })
    .eq('id', messageId)
    .select('*')
    .single();
    
  if (error) {
    throw error;
  }
  
  return transformDatabaseMessage(data);
};

/**
 * Flag a message as inappropriate
 */
export const flagChatMessage = async (messageId: string, reason: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .update({
      is_flagged: true,
      flag_reason: reason
    })
    .eq('id', messageId);
    
  if (error) {
    throw error;
  }
};
