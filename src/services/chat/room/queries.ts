import { supabase, DatabaseChatRoom } from "../supabaseClient";
import { ChatRoom } from "@/types/chat";
import { transformDatabaseRoom } from "./types";

// Get a chat room by ID
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*, chat_participants(*)')
      .eq('id', roomId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Transform and return as ChatRoom
    const room = transformDatabaseRoom(data);
    return room;
  } catch (error) {
    console.error("Error fetching chat room:", error);
    return null;
  }
};

// Get a work order chat room
export const getWorkOrderChatRoom = async (workOrderId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('work_order_id', workOrderId)
      .eq('type', 'work_order')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No room found
      }
      throw error;
    }
    
    if (!data) return null;
    
    // Transform and return as ChatRoom
    const room = transformDatabaseRoom(data);
    return room;
  } catch (error) {
    console.error("Error fetching work order chat room:", error);
    return null;
  }
};

// Get a shift chat room by date or ID
export const getShiftChatRoom = async (dateOrId: Date | string): Promise<ChatRoom | null> => {
  try {
    let roomId: string;
    
    // If we got a Date object, convert it to the expected ID format
    if (dateOrId instanceof Date) {
      const dateStr = dateOrId.toISOString().split('T')[0]; // YYYY-MM-DD
      roomId = `shift-chat-${dateStr}`;
    } else {
      // Otherwise, assume we've been given the ID directly
      roomId = dateOrId;
    }
    
    // Now get the room by ID
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No room found
      }
      throw error;
    }
    
    if (!data) return null;
    
    // Transform and return as ChatRoom
    const room = transformDatabaseRoom(data);
    return room;
  } catch (error) {
    console.error("Error fetching shift chat room:", error);
    return null;
  }
};
