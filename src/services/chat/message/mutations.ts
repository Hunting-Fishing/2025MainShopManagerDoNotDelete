
import { ChatMessage } from "@/types/chat";
import { supabase, DatabaseChatMessage } from "../supabaseClient";
import { MessageSendParams, MessageFlagParams, getMessageType, transformDatabaseMessage } from "./types";

// Send a message to a chat room
export const sendMessage = async (message: MessageSendParams): Promise<ChatMessage> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: message.room_id,
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        content: message.content,
        is_read: false,
        message_type: getMessageType(message.content)
      } as Partial<DatabaseChatMessage>])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the room's updated_at timestamp
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.room_id);
    
    return transformDatabaseMessage(data as DatabaseChatMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true } as Partial<DatabaseChatMessage>)
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Flag a message for attention
export const flagChatMessage = async ({ messageId, reason, userId }: MessageFlagParams): Promise<void> => {
  try {
    // Update the message to mark it as flagged
    const { error } = await supabase
      .from('chat_messages')
      .update({
        is_flagged: true,
        flag_reason: reason,
        metadata: {
          flagged_by: userId,
          flagged_at: new Date().toISOString()
        }
      } as Partial<DatabaseChatMessage>)
      .eq('id', messageId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error flagging message:", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
