
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessage, ChatParticipant } from "@/types/chat";
import { TeamMember } from "@/types/team";

// Get all chat rooms for the current user
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  const { data, error } = await supabase
    .from('chat_participants')
    .select(`
      room_id,
      chat_rooms:room_id(*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }

  return data.map((item) => item.chat_rooms) || [];
};

// Get messages for a specific chat room
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }

  return data || [];
};

// Send a new message
export const sendMessage = async (message: Omit<ChatMessage, 'id' | 'created_at' | 'is_read'>): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{ ...message, is_read: false }])
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  return data;
};

// Mark messages as read
export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('room_id', roomId)
    .neq('sender_id', userId);

  if (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Create a new chat room
export const createChatRoom = async (
  roomName: string, 
  roomType: 'direct' | 'group' | 'work_order',
  participants: string[],
  workOrderId?: string
): Promise<ChatRoom> => {
  // Create transaction
  const { data: roomData, error: roomError } = await supabase
    .from('chat_rooms')
    .insert([{
      name: roomName,
      type: roomType,
      work_order_id: workOrderId
    }])
    .select()
    .single();

  if (roomError) {
    console.error("Error creating chat room:", roomError);
    throw roomError;
  }

  // Add participants
  const participantsToInsert = participants.map(userId => ({
    room_id: roomData.id,
    user_id: userId
  }));

  const { error: participantsError } = await supabase
    .from('chat_participants')
    .insert(participantsToInsert);

  if (participantsError) {
    console.error("Error adding participants:", participantsError);
    throw participantsError;
  }

  return roomData;
};

// Get work order specific chat room
export const getWorkOrderChatRoom = async (workOrderId: string): Promise<ChatRoom | null> => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('work_order_id', workOrderId)
    .eq('type', 'work_order')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No chat room found for this work order
      return null;
    }
    console.error("Error fetching work order chat room:", error);
    throw error;
  }

  return data;
};

// Subscribe to new messages in a chat room
export const subscribeToMessages = (
  roomId: string,
  callback: (message: ChatMessage) => void
) => {
  const channel = supabase
    .channel('public:chat_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        callback(payload.new as ChatMessage);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Get chat participants
export const getChatParticipants = async (roomId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('chat_participants')
    .select('user_id')
    .eq('room_id', roomId);

  if (error) {
    console.error("Error fetching chat participants:", error);
    throw error;
  }

  return data.map(p => p.user_id) || [];
};

// Add a participant to a chat room
export const addParticipant = async (roomId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_participants')
    .insert([{ room_id: roomId, user_id: userId }]);

  if (error) {
    console.error("Error adding participant:", error);
    throw error;
  }
};

// Get all direct chats with a specific user
export const getDirectChatWithUser = async (currentUserId: string, otherUserId: string): Promise<ChatRoom | null> => {
  // Find rooms where both users are participants
  const { data: currentUserRooms, error: currentUserError } = await supabase
    .from('chat_participants')
    .select('room_id')
    .eq('user_id', currentUserId);

  if (currentUserError) {
    console.error("Error fetching current user rooms:", currentUserError);
    throw currentUserError;
  }

  if (!currentUserRooms.length) return null;

  const roomIds = currentUserRooms.map(r => r.room_id);

  const { data: sharedRooms, error: sharedRoomsError } = await supabase
    .from('chat_participants')
    .select('room_id')
    .eq('user_id', otherUserId)
    .in('room_id', roomIds);

  if (sharedRoomsError) {
    console.error("Error fetching shared rooms:", sharedRoomsError);
    throw sharedRoomsError;
  }

  if (!sharedRooms.length) return null;

  const sharedRoomIds = sharedRooms.map(r => r.room_id);

  // Find direct chat rooms among the shared rooms
  const { data: directRooms, error: directRoomsError } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('type', 'direct')
    .in('id', sharedRoomIds)
    .limit(1);

  if (directRoomsError) {
    console.error("Error fetching direct rooms:", directRoomsError);
    throw directRoomsError;
  }

  return directRooms.length > 0 ? directRooms[0] : null;
};
