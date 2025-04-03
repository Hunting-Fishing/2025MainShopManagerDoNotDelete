
import { ChatRoom } from "@/types/chat";
import { supabase, assertChatRoomType, DatabaseChatRoom } from "./supabaseClient";

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
          ...room,
          type: assertChatRoomType(room.type),
          last_message: lastMessage,
          unread_count: unreadCount,
          is_pinned: room.is_pinned || false,
          is_archived: room.is_archived || false,
          metadata: room.metadata || null
        };
      })
    );
    
    return enhancedRooms;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
};

// Get a chat room by work order ID
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
    
    const room = data as DatabaseChatRoom;
    
    return {
      ...room,
      type: assertChatRoomType(room.type),
      is_pinned: room.is_pinned || false,
      is_archived: room.is_archived || false,
      metadata: room.metadata || null
    };
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
    
    const room = directRooms as DatabaseChatRoom;
    
    return {
      ...room,
      type: assertChatRoomType(room.type),
      is_pinned: room.is_pinned || false,
      is_archived: room.is_archived || false,
      metadata: room.metadata || null
    };
  } catch (error) {
    console.error("Error fetching direct chat:", error);
    throw error;
  }
};

// Get chat room details
export const getChatRoomDetails = async (roomId: string): Promise<ChatRoom> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) throw error;
    
    const room = data as DatabaseChatRoom;
    
    return {
      ...room,
      type: assertChatRoomType(room.type),
      is_pinned: room.is_pinned || false,
      is_archived: room.is_archived || false,
      metadata: room.metadata || null
    };
  } catch (error) {
    console.error("Error fetching chat room details:", error);
    throw error;
  }
};

// Create a new chat room
export const createChatRoom = async (
  name: string,
  type: "direct" | "group" | "work_order",
  participants: string[],
  workOrderId?: string,
  metadata?: any
): Promise<ChatRoom> => {
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
    
    const typedRoom = room as DatabaseChatRoom;
    
    return {
      ...typedRoom,
      type: assertChatRoomType(typedRoom.type),
      is_pinned: typedRoom.is_pinned || false,
      is_archived: typedRoom.is_archived || false,
      metadata: typedRoom.metadata || null
    };
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
