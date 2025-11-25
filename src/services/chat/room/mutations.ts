
import { supabase } from "../supabaseClient";
import { ChatRoom } from "@/types/chat";
import { CreateRoomParams, transformDatabaseRoom } from "./types";

// Create a new chat room
export const createChatRoom = async (params: CreateRoomParams): Promise<ChatRoom> => {
  console.log('[createChatRoom] Starting room creation:', {
    name: params.name,
    type: params.type,
    participantsCount: params.participants.length,
    hasWorkOrderId: !!params.workOrderId
  });

  try {
    // Log current auth session for debugging RLS issues
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[createChatRoom] Auth session before insert:', {
      hasSession: !!session,
      userId: session?.user?.id,
      sessionError
    });

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
      console.log('[createChatRoom] Using provided room ID:', params.id);
    }

    console.log('[createChatRoom] Inserting room into database');
    
    // Create the room
    const { data: room, error: roomError } = params.id 
      ? await supabase.from('chat_rooms').upsert([roomData]).select().single()
      : await supabase.from('chat_rooms').insert([roomData]).select().single();
    
    if (roomError) {
      console.error('[createChatRoom] Room creation failed:', {
        error: roomError,
        message: roomError.message,
        code: roomError.code,
        details: roomError.details,
        hint: roomError.hint
      });
      throw roomError;
    }
    
    console.log('[createChatRoom] Room created successfully:', room.id);
    console.log('[createChatRoom] Adding participants:', params.participants);
    
    // Add participants to the room
    const participantData = params.participants.map(userId => ({
      room_id: room.id,
      user_id: userId
    }));
    
    const { error: participantError } = await supabase
      .from('chat_participants')
      .upsert(participantData);
    
    if (participantError) {
      console.error('[createChatRoom] Participant insertion failed:', {
        error: participantError,
        message: participantError.message,
        code: participantError.code,
        details: participantError.details,
        hint: participantError.hint,
        roomId: room.id,
        participants: params.participants
      });
      throw participantError;
    }
    
    console.log('[createChatRoom] Participants added successfully');
    const transformedRoom = transformDatabaseRoom(room);
    console.log('[createChatRoom] Room creation complete:', transformedRoom.id);
    
    return transformedRoom;
  } catch (error: any) {
    console.error('[createChatRoom] Fatal error creating chat room:', {
      error,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      params,
      timestamp: new Date().toISOString()
    });
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
