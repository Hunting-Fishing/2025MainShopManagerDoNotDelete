
import { supabase } from '@/lib/supabase';

export async function createCalendarEvent(eventData: any) {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

export async function updateCalendarEvent(eventId: string, eventData: any) {
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
    console.error('Error updating calendar event:', error);
    return null;
  }
}

export async function getCalendarEventByWorkOrderId(workOrderId: string) {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('work_order_id', workOrderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return null;
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}
