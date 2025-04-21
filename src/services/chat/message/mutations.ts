
import { ChatMessage } from "@/types/chat";
import { supabase, DatabaseChatMessage } from "../supabaseClient";
import { MessageSendParams, MessageFlagParams, MessageEditParams, getMessageType, transformDatabaseMessage, parseTaggedItems } from "./types";

// Send a message to a chat room
export const sendMessage = async (message: MessageSendParams): Promise<ChatMessage> => {
  try {
    // Parse tagged items from the message content
    const taggedItems = parseTaggedItems(message.content);
    
    // Create metadata with tagged items
    const metadata = {
      ...message.metadata,
      taggedItems: taggedItems
    };
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: message.room_id,
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        content: message.content,
        is_read: false,
        message_type: message.message_type || getMessageType(message.content),
        metadata: metadata
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

// Edit a message
export const editMessage = async ({ messageId, content, userId }: MessageEditParams): Promise<ChatMessage> => {
  try {
    // First get the original message
    const { data: originalMessage, error: fetchError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Make sure the user can edit this message
    if (originalMessage.sender_id !== userId) {
      throw new Error("You can only edit your own messages");
    }
    
    // Parse tagged items from the new content
    const taggedItems = parseTaggedItems(content);
    
    // Update the message
    const { data, error } = await supabase
      .from('chat_messages')
      .update({
        content: content,
        is_edited: true,
        edited_at: new Date().toISOString(),
        original_content: originalMessage.original_content || originalMessage.content,
        metadata: {
          ...originalMessage.metadata,
          taggedItems: taggedItems,
          edit_history: [
            ...(originalMessage.metadata?.edit_history || []),
            {
              previous_content: originalMessage.content,
              edited_at: new Date().toISOString()
            }
          ]
        }
      } as Partial<DatabaseChatMessage>)
      .eq('id', messageId)
      .select()
      .single();
      
    if (error) throw error;
    
    return transformDatabaseMessage(data as DatabaseChatMessage);
  } catch (error) {
    console.error("Error editing message:", error);
    throw error;
  }
};

// Save message to a record (e.g., work order)
export const saveMessageToRecord = async (messageId: string, recordType: string, recordId: string): Promise<void> => {
  try {
    // First get the message
    const { data: message, error: fetchError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Update the message metadata to include saved_to information
    const updatedMetadata = {
      ...(message.metadata || {}),
      saved_to: {
        ...((message.metadata?.saved_to) || {}),
        [recordType]: recordId,
        saved_at: new Date().toISOString()
      }
    };
    
    // Update the message
    const { error } = await supabase
      .from('chat_messages')
      .update({
        metadata: updatedMetadata
      })
      .eq('id', messageId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error saving message to record:", error);
    throw error;
  }
};
