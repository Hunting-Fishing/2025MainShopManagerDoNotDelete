
import { ChatRoom } from "@/types/chat";
import { supabase } from "../supabaseClient";

// Get all chat rooms for a specific user
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    // First, get all the rooms where this user is a participant
    const { data: participations, error: participationsError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', userId);
    
    if (participationsError) throw participationsError;
    
    if (!participations || participations.length === 0) {
      return []; // No rooms for this user
    }
    
    // Extract room IDs
    const roomIds = participations.map(p => p.room_id);
    
    // Now get the actual room data
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        chat_messages!chat_messages_room_id_fkey (
          *
        )
      `)
      .in('id', roomIds)
      .order('updated_at', { ascending: false });
    
    if (roomsError) throw roomsError;
    
    // Transform the data to our ChatRoom type
    const chatRooms: ChatRoom[] = (rooms || []).map(room => {
      // Find last message
      const messages = room.chat_messages || [];
      messages.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const lastMessage = messages.length > 0 ? messages[0] : null;
      
      // Count unread messages
      const unreadCount = messages.filter((msg: any) => 
        !msg.is_read && msg.sender_id !== userId
      ).length;
      
      return {
        id: room.id,
        name: room.name,
        type: room.type,
        work_order_id: room.work_order_id,
        created_at: room.created_at,
        updated_at: room.updated_at,
        last_message: lastMessage,
        unread_count: unreadCount,
        is_pinned: room.is_pinned,
        is_archived: room.is_archived,
        metadata: room.metadata
      };
    });
    
    return chatRooms;
  } catch (error) {
    console.error("Error fetching user chat rooms:", error);
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
      .eq('type', 'work_order')
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      work_order_id: data.work_order_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_pinned: data.is_pinned,
      is_archived: data.is_archived,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Error fetching work order chat room:", error);
    throw error;
  }
};

// Get a chat room for a specific shift
export const getShiftChatRoom = async (dateOrId: Date | string): Promise<ChatRoom | null> => {
  try {
    let roomId: string;
    
    if (dateOrId instanceof Date) {
      const dateStr = dateOrId.toISOString().split('T')[0]; // YYYY-MM-DD format
      roomId = `shift-chat-${dateStr}`;
    } else {
      roomId = dateOrId;
    }
    
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      work_order_id: data.work_order_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_pinned: data.is_pinned,
      is_archived: data.is_archived,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Error fetching shift chat room:", error);
    throw error;
  }
};
