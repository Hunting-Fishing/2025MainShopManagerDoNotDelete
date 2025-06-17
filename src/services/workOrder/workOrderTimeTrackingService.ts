
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/workOrder';

export async function getWorkOrderTimeEntries(workOrderId: string): Promise<TimeEntry[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching work order time entries:', error);
    throw error;
  }
}

export async function addTimeEntryToWorkOrder(workOrderId: string, entryData: Partial<TimeEntry>): Promise<TimeEntry> {
  try {
    // Add the work_order_id to the entry data
    const fullEntryData = {
      ...entryData,
      work_order_id: workOrderId
    };

    const { data, error } = await supabase
      .from('work_order_time_entries')
      .insert(fullEntryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating time entry:', error);
    throw error;
  }
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }
}

export async function deleteTimeEntry(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_time_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting time entry:', error);
    throw error;
  }
}
