
import { supabase, DatabaseChatRoom } from "../supabaseClient";
import { ChatRoom } from "@/types/chat";
import { CreateRoomParams, transformDatabaseRoom } from "./types";

// Create a new chat room
export const createChatRoom = async ({
  name,
  type,
  participants,
  workOrderId,
  metadata
}: CreateRoomParams): Promise<ChatRoom> => {
  try {
    // Create the chat room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert([{
        name,
        type,
        work_order_id: workOrderId,
        metadata: metadata || null,
        is_pinned: false,
        is_archived: false
      } as Partial<DatabaseChatRoom>])
      .select()
      .single();
    
    if (roomError) throw roomError;
    
    // Add participants to the room
    const participantsData = participants.map(userId => ({
      room_id: room.id,
      user_id: userId
    }));
    
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participantsData);
    
    if (participantsError) throw participantsError;
    
    return transformDatabaseRoom(room as DatabaseChatRoom);
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
      .update({ is_pinned: isPinned } as Partial<DatabaseChatRoom>)
      .eq('id', roomId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error pinning/unpinning chat room:", error);
    throw error;
  }
};

// Archive or unarchive a chat room
export const archiveChatRoom = async (roomId: string, isArchived: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_archived: isArchived } as Partial<DatabaseChatRoom>)
      .eq('id', roomId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error archiving/unarchiving chat room:", error);
    throw error;
  }
};
