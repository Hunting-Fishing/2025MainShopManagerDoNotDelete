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
export const getShiftChatRoom = async (date: Date): Promise<ChatRoom | null> => {
  try {
    const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('type', 'group')
      .contains('metadata', { is_shift_chat: true })
      .contains('metadata', { shift_date: dateStr })
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No chat room found for this date
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    // Transform the database object to a ChatRoom
    return transformDatabaseRoom(data);
  } catch (error) {
    console.error("Error fetching shift chat room:", error);
    return null;
  }
};
