
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom } from "@/types/chat";
import { transformDatabaseRoom } from "./types";

/**
 * Get a chat room by ID
 */
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
      
    if (error) throw error;
    
    // Apply transformation to ensure proper types
    return data ? transformDatabaseRoom(data) : null;
  } catch (error) {
    console.error("Error getting chat room:", error);
    throw error;
  }
};

/**
 * Get a work order chat room
 */
export const getWorkOrderChatRoom = async (workOrderId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('work_order_id', workOrderId)
      .maybeSingle();
      
    if (error) throw error;
    
    // Apply transformation to ensure proper types
    return data ? transformDatabaseRoom(data) : null;
  } catch (error) {
    console.error("Error getting work order chat room:", error);
    throw error;
  }
};

/**
 * Get shift chat room for a specific date or ID
 */
export const getShiftChatRoom = async (dateOrId: Date | string): Promise<ChatRoom | null> => {
  try {
    if (typeof dateOrId === 'string' && dateOrId.startsWith('shift-chat-')) {
      // If it's a shift chat ID
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', dateOrId)
        .maybeSingle();
        
      if (error) throw error;
      
      // Apply transformation to ensure proper types
      return data ? transformDatabaseRoom(data) : null;
    } else {
      // If it's a date, convert to ISO string YYYY-MM-DD
      let dateStr: string;
      
      if (dateOrId instanceof Date) {
        dateStr = dateOrId.toISOString().split('T')[0];
      } else {
        dateStr = dateOrId;
      }
      
      // Find shift chat by metadata
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('metadata->is_shift_chat', true)
        .filter('metadata->shift_date', 'like', `${dateStr}%`)
        .maybeSingle();
        
      if (error) throw error;
      
      // Apply transformation to ensure proper types
      return data ? transformDatabaseRoom(data) : null;
    }
  } catch (error) {
    console.error("Error getting shift chat room:", error);
    throw error;
  }
};
