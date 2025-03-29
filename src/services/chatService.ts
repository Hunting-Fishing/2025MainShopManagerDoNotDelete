
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessage, ChatParticipant } from "@/types/chat";
import { RealtimeChannel } from "@supabase/supabase-js";

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
      (rooms || []).map(async (room) => {
        // Get last message
        const { data: lastMessages } = await supabase
          .rpc('get_room_last_message', { p_room_id: room.id });
        
        const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null;
        
        // Get unread count
        const { data: unreadCount } = await supabase
          .rpc('get_room_unread_count', { 
            p_room_id: room.id,
            p_user_id: userId
          });
        
        return {
          ...room,
          last_message: lastMessage,
          unread_count: unreadCount || 0
        };
      })
    );
    
    return enhancedRooms;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
};

// Get messages for a specific chat room
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};

// Send a message to a chat room
export const sendMessage = async (message: Omit<ChatMessage, "id" | "is_read" | "created_at">): Promise<ChatMessage> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: message.room_id,
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        content: message.content,
        is_read: false
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the room's updated_at timestamp
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.room_id);
    
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .rpc('mark_messages_as_read', {
        p_room_id: roomId,
        p_user_id: userId
      });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error marking messages as read:", error);
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
    return data;
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
    
    return directRooms;
  } catch (error) {
    console.error("Error fetching direct chat:", error);
    throw error;
  }
};

// Create a new chat room
export const createChatRoom = async (
  name: string,
  type: "direct" | "group" | "work_order",
  participants: string[],
  workOrderId?: string
): Promise<ChatRoom> => {
  try {
    // Create the chat room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert([{
        name,
        type,
        work_order_id: workOrderId
      }])
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
    
    return room;
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

// Subscribe to new messages in a chat room
export const subscribeToMessages = (roomId: string, callback: (message: ChatMessage) => void): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      callback(payload.new as ChatMessage);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
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
    
    return data;
  } catch (error) {
    console.error("Error fetching chat room details:", error);
    throw error;
  }
};

// Get participants for a chat room
export const getChatParticipants = async (roomId: string): Promise<ChatParticipant[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('room_id', roomId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching chat participants:", error);
    throw error;
  }
};

// Add participant to a chat room
export const addParticipantToRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_participants')
      .insert([{
        room_id: roomId,
        user_id: userId
      }]);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error adding participant to room:", error);
    throw error;
  }
};
