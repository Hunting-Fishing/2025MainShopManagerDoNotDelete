
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { CalendarEvent, CreateCalendarEventDto } from "@/types/calendar/events";

/**
 * Creates a new calendar event
 */
export const createCalendarEvent = async (eventData: CreateCalendarEventDto) => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
};

/**
 * Updates an existing calendar event
 */
export const updateCalendarEvent = async (eventId: string, eventData: Partial<CreateCalendarEventDto>) => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    throw error;
  }
};

/**
 * Deletes a calendar event
 */
export const deleteCalendarEvent = async (eventId: string) => {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return false;
  }
};

/**
 * Retrieves a calendar event by work order ID
 */
export const getCalendarEventByWorkOrderId = async (workOrderId: string) => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('work_order_id', workOrderId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" which is not a real error
    return data;
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    return null;
  }
};
