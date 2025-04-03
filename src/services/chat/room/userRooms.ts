
import { supabase, DatabaseChatRoom } from "../supabaseClient";
import { ChatRoom } from "@/types/chat";
import { transformDatabaseRoom } from "./types";

// Get all chat rooms for a user
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    // Get rooms where the user is a participant
    const { data: participantRooms, error: participantError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', userId);
    
    if (participantError) throw participantError;
    
    if (!participantRooms || participantRooms.length === 0) {
      return [];
    }
    
    const roomIds = participantRooms.map(p => p.room_id);
    
    // Get the room details
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .in('id', roomIds);
    
    if (roomsError) throw roomsError;
    
    // Enhance rooms with last message and unread count
    const enhancedRooms: ChatRoom[] = await Promise.all(
      (rooms || []).map(async (room: DatabaseChatRoom) => {
        // Get last message
        const { data: lastMessages, error: lastMessageError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (lastMessageError) console.error("Error fetching last message:", lastMessageError);
        
        const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null;
        
        // Get unread count
        const { data: unreadCountData, error: unreadCountError } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact' })
          .eq('room_id', room.id)
          .eq('is_read', false)
          .neq('sender_id', userId);
        
        if (unreadCountError) console.error("Error fetching unread count:", unreadCountError);
        
        const unreadCount = unreadCountData ? (unreadCountData as any).count || 0 : 0;
        
        return {
          ...transformDatabaseRoom(room),
          last_message: lastMessage,
          unread_count: unreadCount
        };
      })
    );
    
    return enhancedRooms;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
};
