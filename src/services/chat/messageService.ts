
import { ChatMessage } from "@/types/chat";
import { supabase, DatabaseChatMessage } from "./supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

// Get messages for a specific chat room
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};

// Send a message to a chat room
export const sendMessage = async (message: Omit<ChatMessage, "id" | "is_read" | "created_at">): Promise<ChatMessage> => {
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
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the room's updated_at timestamp
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.room_id);
    
    return data;
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
      .update({ is_read: true })
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Subscribe to new messages in a chat room
export const subscribeToMessages = (roomId: string, callback: (message: ChatMessage) => void): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      callback(payload.new as ChatMessage);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Flag a message for attention
export const flagChatMessage = async (messageId: string, reason: string, userId: string): Promise<void> => {
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

// Helper function to determine the message type based on content
const getMessageType = (content: string): ChatMessage['message_type'] => {
  if (content.startsWith('audio:')) return 'audio';
  if (content.startsWith('image:')) return 'image';
  if (content.startsWith('video:')) return 'video';
  if (content.startsWith('file:') || content.startsWith('document:')) return 'file';
  if (content.startsWith('system:')) return 'system';
  if (content.startsWith('work_order:')) return 'work_order';
  return 'text';
};
