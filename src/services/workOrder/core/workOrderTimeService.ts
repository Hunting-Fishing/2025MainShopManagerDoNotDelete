
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/workOrder';

/**
 * Work order time tracking service
 */
export const workOrderTimeService = {
  /**
   * Get all time entries for a work order
   */
  async getByWorkOrderId(workOrderId: string): Promise<TimeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_time_entries')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  },

  /**
   * Create new time entry
   */
  async create(timeEntryData: Partial<TimeEntry>): Promise<TimeEntry> {
    try {
      const { data, error } = await supabase
        .from('work_order_time_entries')
        .insert(timeEntryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  },

  /**
   * Update time entry
   */
  async update(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
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
  },

  /**
   * Delete time entry
   */
  async delete(id: string): Promise<void> {
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
};
