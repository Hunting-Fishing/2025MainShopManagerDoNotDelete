
import { supabase } from "@/lib/supabase";
import { ShiftChat, CreateShiftChatDto } from "@/types/calendar/events";
import { handleApiError } from "@/utils/errorHandling";
import { format } from "date-fns";

/**
 * Fetch shift chats for a specific date or date range
 */
export async function getShiftChats(
  startDate?: string,
  endDate?: string
): Promise<ShiftChat[]> {
  try {
    let query = supabase.from('shift_chats').select('*');
    
    if (startDate) {
      query = query.gte('shift_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('shift_date', endDate);
    }
    
    const { data, error } = await query.order('shift_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    handleApiError(error, "Failed to fetch shift chats");
    return [];
  }
}

/**
 * Create a new shift chat and corresponding chat room
 */
export async function createShiftChat(
  shiftData: CreateShiftChatDto
): Promise<ShiftChat | null> {
  try {
    // First create a chat room for this shift
    const { data: roomData, error: roomError } = await supabase
      .from('chat_rooms')
      .insert([{
        name: `${shiftData.shift_name} - ${format(new Date(shiftData.shift_date), 'MMM d, yyyy')}`,
        type: 'group',
        metadata: {
          is_shift_chat: true,
          shift_date: shiftData.shift_date,
          shift_name: shiftData.shift_name,
          shift_time: {
            start: shiftData.start_time,
            end: shiftData.end_time
          }
        }
      }])
      .select()
      .single();
      
    if (roomError) throw roomError;
    
    // Now create the shift chat
    const { data, error } = await supabase
      .from('shift_chats')
      .insert([{
        ...shiftData,
        chat_room_id: roomData.id
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // If there are technician IDs, add them as participants
    if (shiftData.technician_ids && shiftData.technician_ids.length > 0) {
      const participantsToInsert = shiftData.technician_ids.map(techId => ({
        room_id: roomData.id,
        user_id: techId
      }));
      
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert(participantsToInsert);
        
      if (participantError) {
        console.error("Error adding participants to shift chat:", participantError);
      }
    }
    
    return data;
  } catch (error) {
    handleApiError(error, "Failed to create shift chat");
    return null;
  }
}

/**
 * Get shift chats for a specific chat room ID
 */
export async function getShiftChatByRoomId(chatRoomId: string): Promise<ShiftChat | null> {
  try {
    const { data, error } = await supabase
      .from('shift_chats')
      .select('*')
      .eq('chat_room_id', chatRoomId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    handleApiError(error, "Failed to fetch shift chat");
    return null;
  }
}
