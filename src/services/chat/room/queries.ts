
import { supabase } from "../supabaseClient";
import { ChatRoom } from "@/types/chat";
import { transformDatabaseRoom } from "./types";

// Get a chat room by ID
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return transformDatabaseRoom(data);
  } catch (error) {
    console.error("Error fetching chat room:", error);
    throw error;
  }
};

// Get chat room for a specific work order
export const getWorkOrderChatRoom = async (workOrderId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('work_order_id', workOrderId)
      .eq('type', 'work_order')
      .single();
    
    if (error) {
      // If not found, return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    return transformDatabaseRoom(data);
  } catch (error) {
    console.error("Error fetching work order chat room:", error);
    throw error;
  }
};

// Get chat room for a shift by ID or date
export const getShiftChatRoom = async (dateOrId: Date | string): Promise<ChatRoom | null> => {
  try {
    let roomId: string;
    
    // If it's a Date object, convert to shift-chat-YYYY-MM-DD format
    if (dateOrId instanceof Date) {
      const dateStr = dateOrId.toISOString().split('T')[0]; // YYYY-MM-DD
      roomId = `shift-chat-${dateStr}`;
    } else {
      // If it's already an ID string, use it directly
      roomId = dateOrId;
    }
    
    // Fetch the room by ID
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    return transformDatabaseRoom(data);
  } catch (error) {
    console.error("Error fetching shift chat room:", error);
    throw error;
  }
};
