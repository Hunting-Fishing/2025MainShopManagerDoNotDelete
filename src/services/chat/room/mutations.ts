
import { supabase } from "../supabaseClient";
import { ChatRoom } from "@/types/chat";
import { CreateRoomParams, transformDatabaseRoom } from "./types";

// Create a new chat room
export const createChatRoom = async (params: CreateRoomParams): Promise<ChatRoom> => {
  try {
    // Prepare the room data - only include id if provided
    const roomData: any = {
      name: params.name,
      type: params.type,
      work_order_id: params.workOrderId,
      metadata: params.metadata as any
    };
    
    // Only add ID if explicitly provided
    if (params.id) {
      roomData.id = params.id;
    }

    // Create the room
    const { data: room, error: roomError } = params.id 
      ? await supabase.from('chat_rooms').upsert([roomData]).select().single()
      : await supabase.from('chat_rooms').insert([roomData]).select().single();
    
    if (roomError) throw roomError;
    
    // Add participants to the room
    const participantData = params.participants.map(userId => ({
      room_id: room.id,
      user_id: userId
    }));
    
    const { error: participantError } = await supabase
      .from('chat_participants')
      .upsert(participantData);
    
    if (participantError) throw participantError;
    
    return transformDatabaseRoom(room);
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

// Pin or unpin a chat room
export const pinChatRoom = async (roomId: string, isPinned: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
      .eq('id', roomId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error pinning chat room:", error);
    throw error;
  }
};

// Archive or unarchive a chat room
export const archiveChatRoom = async (roomId: string, isArchived: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_archived: isArchived, updated_at: new Date().toISOString() })
      .eq('id', roomId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error archiving chat room:", error);
    throw error;
  }
};
