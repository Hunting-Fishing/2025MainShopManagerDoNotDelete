
import { supabase, DatabaseChatRoom } from "../supabaseClient";
import { ChatRoom, ChatMessage } from "@/types/chat";
import { GetRoomOptions, transformDatabaseRoom } from "./types";

// Get a chat room by ID with options for additional data
export const getChatRoomDetails = async (roomId: string, options?: GetRoomOptions): Promise<ChatRoom> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) throw error;
    
    const room = transformDatabaseRoom(data as DatabaseChatRoom);
    
    // Enhance with additional data if requested
    if (options?.includeLastMessage) {
      const { data: lastMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (lastMessages && lastMessages.length > 0) {
        room.last_message = lastMessages[0] as ChatMessage;
      }
    }
    
    return room;
  } catch (error) {
    console.error("Error fetching chat room details:", error);
    throw error;
  }
};

// Get chat room by work order ID
export const getWorkOrderChatRoom = async (workOrderId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('type', 'work_order')
      .eq('work_order_id', workOrderId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return transformDatabaseRoom(data as DatabaseChatRoom);
  } catch (error) {
    console.error("Error fetching work order chat room:", error);
    throw error;
  }
};

// Get direct chat with a specific user
export const getDirectChatWithUser = async (currentUserId: string, otherUserId: string): Promise<ChatRoom | null> => {
  try {
    // Get all direct chat rooms where the current user is a participant
    const { data: currentUserRooms, error: currentUserError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', currentUserId);
    
    if (currentUserError) throw currentUserError;
    
    if (!currentUserRooms || currentUserRooms.length === 0) {
      return null;
    }
    
    const roomIds = currentUserRooms.map(p => p.room_id);
    
    // Check if the other user is in any of those rooms
    const { data: sharedRooms, error: sharedRoomsError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', otherUserId)
      .in('room_id', roomIds);
    
    if (sharedRoomsError) throw sharedRoomsError;
    
    if (!sharedRooms || sharedRooms.length === 0) {
      return null;
    }
    
    const sharedRoomIds = sharedRooms.map(p => p.room_id);
    
    // Get the direct chat rooms among the shared rooms
    const { data: directRooms, error: directRoomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('type', 'direct')
      .in('id', sharedRoomIds)
      .maybeSingle();
    
    if (directRoomsError) throw directRoomsError;
    
    if (!directRooms) return null;
    
    return transformDatabaseRoom(directRooms as DatabaseChatRoom);
  } catch (error) {
    console.error("Error fetching direct chat:", error);
    throw error;
  }
};

// Get a chat room for a specific shift date
export const getShiftChatRoom = async (date: Date | string): Promise<ChatRoom | null> => {
  try {
    // First check if the input is a shift-chat ID
    if (typeof date === 'string' && date.startsWith('shift-chat-')) {
      // Try to fetch directly by ID
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', date)
        .maybeSingle();
      
      if (!error && data) {
        return transformDatabaseRoom(data);
      }

      // If not found by direct ID, try to search by shift-date pattern in metadata
      // Extract the date part if format is shift-chat-YYYY-MM-DD
      const dateMatch = date.match(/shift-chat-(\d{4}-\d{2}-\d{2})/);
      if (dateMatch && dateMatch[1]) {
        const extractedDate = dateMatch[1];
        const { data: metadataData, error: metadataError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('type', 'group')
          .filter('metadata->is_shift_chat', 'eq', true)
          .filter('metadata->shift_date', 'ilike', `%${extractedDate}%`)
          .maybeSingle();

        if (!metadataError && metadataData) {
          return transformDatabaseRoom(metadataData);
        }
      }
    }
    
    // Handle both Date objects and string dates for regular date search
    const dateStr = typeof date === 'string' 
      ? date 
      : date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Search by metadata with the date string
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('type', 'group')
      .filter('metadata->is_shift_chat', 'eq', true)
      .filter('metadata->shift_date', 'ilike', `%${dateStr}%`)
      .maybeSingle();
    
    if (error) {
      console.error("Error in getShiftChatRoom:", error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform the database object to a ChatRoom
    return transformDatabaseRoom(data);
  } catch (error) {
    console.error("Error fetching shift chat room:", error);
    return null;
  }
};
