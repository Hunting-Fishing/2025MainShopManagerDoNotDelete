
import { ChatRoom } from "@/types/chat";
import { supabase } from "@/lib/supabase";
import { RoomSearchParams } from "./types";

// Get a chat room by ID
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching chat room:", error);
    throw error;
  }
};

// Get a chat room for a specific work order
export const getWorkOrderChatRoom = async (workOrderId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('work_order_id', workOrderId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is the code for "No rows returned"
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error("Error fetching work order chat room:", error);
    throw error;
  }
};

// Get all chat rooms for a user
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    // First get all rooms the user is a participant in
    const { data: participantData, error: participantError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', userId);
      
    if (participantError) throw participantError;
    
    const roomIds = participantData.map(p => p.room_id);
    
    if (roomIds.length === 0) {
      return [];
    }
    
    // Get the room details for all these rooms
    const { data: roomData, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .in('id', roomIds)
      .order('updated_at', { ascending: false });
      
    if (roomError) throw roomError;
    
    return roomData || [];
  } catch (error) {
    console.error("Error fetching user chat rooms:", error);
    throw error;
  }
};

// Search chat rooms
export const searchChatRooms = async (params: RoomSearchParams): Promise<ChatRoom[]> => {
  try {
    // First get all rooms the user is a participant in
    const { data: participantData, error: participantError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', params.userId);
      
    if (participantError) throw participantError;
    
    const roomIds = participantData.map(p => p.room_id);
    
    if (roomIds.length === 0) {
      return [];
    }
    
    // Build query for room details
    let query = supabase
      .from('chat_rooms')
      .select('*')
      .in('id', roomIds);
      
    // Add text search if query is provided
    if (params.query) {
      query = query.ilike('name', `%${params.query}%`);
    }
    
    // Exclude archived rooms unless specified
    if (!params.includeArchived) {
      query = query.eq('is_archived', false);
    }
    
    // Add pagination
    query = query
      .order('updated_at', { ascending: false })
      .range(
        params.offset || 0, 
        (params.offset || 0) + (params.limit || 20) - 1
      );
      
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error searching chat rooms:", error);
    throw error;
  }
};
