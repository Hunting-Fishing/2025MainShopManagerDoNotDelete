
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessage } from "@/types/chat";
import { transformDatabaseRoom } from "./types";
import { transformDatabaseMessage } from "../message/types";

/**
 * Get all chat rooms for a user
 */
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    // First get all rooms the user participates in
    const { data: participants, error: participantsError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', userId);
      
    if (participantsError) throw participantsError;
    
    if (!participants || participants.length === 0) {
      return [];
    }
    
    const roomIds = participants.map(p => p.room_id);
    
    // Then fetch the actual rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        last_message:chat_messages(
          *
        )
      `)
      .in('id', roomIds)
      .order('updated_at', { ascending: false });
      
    if (roomsError) throw roomsError;
    
    if (!rooms) return [];
    
    // Process the rooms to format last_message correctly and add unread count
    const processedRooms: ChatRoom[] = await Promise.all(rooms.map(async (room) => {
      // Get unread message count
      const { count, error: countError } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact' })
        .eq('room_id', room.id)
        .eq('is_read', false)
        .neq('sender_id', userId);
        
      // Get last message more reliably
      const { data: lastMessages, error: lastMsgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Transform the database room to match the ChatRoom type
      // This will handle type validation for room.type and last_message.message_type
      const transformedRoom = transformDatabaseRoom(room);
      
      // Add the last message and unread count
      let lastMessage: ChatMessage | null = null;
      if (lastMessages && lastMessages.length > 0) {
        lastMessage = transformDatabaseMessage(lastMessages[0]);
      }
      
      return {
        ...transformedRoom,
        last_message: lastMessage,
        unread_count: countError ? 0 : (count || 0)
      };
    }));
    
    return processedRooms;
  } catch (error) {
    console.error("Error fetching user chat rooms:", error);
    throw error;
  }
};
