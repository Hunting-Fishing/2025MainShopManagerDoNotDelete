
import { supabase } from "@/lib/supabase";
import { ShiftChat, CreateShiftChatDto } from "@/types/calendar/events";
import { handleApiError } from "@/utils/errorHandling";

/**
 * Fetch shift chats for a specified date range
 */
export async function getShiftChats(startDate: string, endDate: string): Promise<ShiftChat[]> {
  try {
    const { data, error } = await supabase
      .from('shift_chats')
      .select('*')
      .gte('shift_date', startDate)
      .lte('shift_date', endDate);

    if (error) throw error;

    // Transform database records to match ShiftChat interface
    return data.map(record => ({
      id: record.id,
      chat_room_id: record.chat_room_id,
      shift_date: record.shift_date,
      shift_name: record.shift_name,
      start_time: record.start_time,
      end_time: record.end_time,
      technician_ids: record.technician_ids || [],
      created_at: record.created_at,
      updated_at: record.updated_at
    }));
  } catch (error) {
    handleApiError(error, "Failed to fetch shift chats");
    return [];
  }
}

/**
 * Create a new shift chat
 */
export async function createShiftChat(data: CreateShiftChatDto): Promise<ShiftChat | null> {
  try {
    const { data: result, error } = await supabase
      .from('shift_chats')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      chat_room_id: result.chat_room_id,
      shift_date: result.shift_date,
      shift_name: result.shift_name,
      start_time: result.start_time,
      end_time: result.end_time,
      technician_ids: result.technician_ids || [],
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  } catch (error) {
    handleApiError(error, "Failed to create shift chat");
    return null;
  }
}
