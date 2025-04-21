
import { supabase } from "../supabaseClient";
import { CreateRoomParams } from "./types";
import { ChatRoom } from "@/types/chat";
import { transformDatabaseRoom } from "./types";

// Create a new chat room
export const createChatRoom = async (params: CreateRoomParams): Promise<ChatRoom> => {
  try {
    // Extract the custom ID if provided
    const { id, ...roomData } = params;
    
    // Prepare room data
    const room = {
      name: roomData.name,
      type: roomData.type,
      work_order_id: roomData.workOrderId,
      metadata: roomData.metadata,
      // If id is provided, use it (for shift chats)
      ...(id ? { id } : {})
    };
    
    // Create the room
    const { data, error } = await supabase
      .from('chat_rooms')
      .upsert([room])
      .select()
      .single();
    
    if (error) throw error;
    
    // Add participants
    const participantPromises = params.participants.map(userId =>
      supabase.from('chat_participants').insert({
        room_id: data.id,
        user_id: userId,
      })
    );
    
    // Wait for all participants to be added
    await Promise.all(participantPromises);
    
    // Return the created room
    return transformDatabaseRoom(data);
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

// Pin/unpin a chat room
export const pinChatRoom = async (roomId: string, isPinned: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_pinned: isPinned })
      .eq('id', roomId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error pinning/unpinning chat room:", error);
    throw error;
  }
};

// Archive/unarchive a chat room
export const archiveChatRoom = async (roomId: string, isArchived: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_archived: isArchived })
      .eq('id', roomId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error archiving/unarchiving chat room:", error);
    throw error;
  }
};
