
import { ChatRoom } from "@/types/chat";
import { supabase } from "@/lib/supabase";
import { CreateRoomParams } from "./types";

// Create a new chat room
export const createChatRoom = async (params: CreateRoomParams): Promise<ChatRoom> => {
  try {
    const roomData = {
      name: params.name,
      type: params.type,
      work_order_id: params.workOrderId,
      metadata: params.metadata || {}
    };
    
    // Create the room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert([roomData])
      .select()
      .single();
      
    if (roomError) throw roomError;
    
    // Add participants to the room
    if (params.participants && params.participants.length > 0) {
      const participantInserts = params.participants.map(userId => ({
        room_id: room.id,
        user_id: userId
      }));
      
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert(participantInserts);
        
      if (participantError) throw participantError;
    }
    
    return room;
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

// Archive a chat room
export const archiveChatRoom = async (roomId: string, isArchived: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_archived: isArchived })
      .eq('id', roomId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error archiving chat room:", error);
    throw error;
  }
};

// Pin a chat room
export const pinChatRoom = async (roomId: string, isPinned: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_pinned: isPinned })
      .eq('id', roomId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error pinning chat room:", error);
    throw error;
  }
};
