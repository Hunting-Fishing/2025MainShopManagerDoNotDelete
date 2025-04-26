
import { supabase } from "../supabaseClient";
import { MessageSendParams, MessageEditParams, MessageFlagParams } from "./types";
import { transformDatabaseMessage } from "./types";

// Send a new chat message
export const sendChatMessage = async (params: MessageSendParams): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert([params]);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

// Send a thread reply
export const sendThreadReply = async (params: MessageSendParams): Promise<void> => {
  try {
    // Insert the message
    const { error } = await supabase
      .from('chat_messages')
      .insert([params]);
    
    if (error) throw error;
    
    // Increment thread_count on parent message
    if (params.thread_parent_id) {
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({
          thread_count: supabase.rpc('increment_thread_count', { message_id: params.thread_parent_id })
        })
        .eq('id', params.thread_parent_id);
      
      if (updateError) {
        console.error("Error updating thread count:", updateError);
      }
    }
  } catch (error) {
    console.error("Error sending thread reply:", error);
    throw error;
  }
};

// Edit an existing chat message
export const editChatMessage = async (params: MessageEditParams): Promise<void> => {
  try {
    // Get current message to preserve original content
    const { data: currentMessage, error: fetchError } = await supabase
      .from('chat_messages')
      .select('content')
      .eq('id', params.messageId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const { error } = await supabase
      .from('chat_messages')
      .update({
        content: params.content,
        is_edited: true,
        edited_at: new Date().toISOString(),
        original_content: currentMessage?.content
      })
      .eq('id', params.messageId)
      .eq('sender_id', params.userId); // Only allow editing own messages
    
    if (error) throw error;
  } catch (error) {
    console.error("Error editing chat message:", error);
    throw error;
  }
};

// Flag a chat message for review
export const flagChatMessage = async (params: MessageFlagParams): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        is_flagged: true,
        flag_reason: params.reason
      })
      .eq('id', params.messageId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error flagging chat message:", error);
    throw error;
  }
};

// Save a message to a work order or vehicle record
export const saveMessageToRecord = async (
  messageId: string, 
  recordType: 'work_order' | 'vehicle', 
  recordId: string
): Promise<void> => {
  try {
    // Get the message
    const { data: message, error: fetchError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Update the message metadata to include saved_to information
    const metadata = {
      ...(message?.metadata || {}),
      saved_to: {
        ...(message?.metadata?.saved_to || {}),
        [recordType]: recordId,
        saved_at: new Date().toISOString()
      }
    };
    
    // Update the message
    const { error } = await supabase
      .from('chat_messages')
      .update({ metadata })
      .eq('id', messageId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error saving message to record:", error);
    throw error;
  }
};
