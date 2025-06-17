
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
      // Ensure required fields are present
      const dbData = {
        work_order_id: timeEntryData.work_order_id!,
        employee_id: timeEntryData.employee_id || '',
        employee_name: timeEntryData.employee_name || 'Unknown Employee',
        start_time: timeEntryData.start_time || new Date().toISOString(),
        end_time: timeEntryData.end_time,
        duration: timeEntryData.duration || 0,
        billable: timeEntryData.billable ?? true,
        notes: timeEntryData.notes
      };

      const { data, error } = await supabase
        .from('work_order_time_entries')
        .insert(dbData)
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
      // Remove undefined values
      const dbUpdates: any = {};
      
      if (updates.employee_id !== undefined) dbUpdates.employee_id = updates.employee_id;
      if (updates.employee_name !== undefined) dbUpdates.employee_name = updates.employee_name;
      if (updates.start_time !== undefined) dbUpdates.start_time = updates.start_time;
      if (updates.end_time !== undefined) dbUpdates.end_time = updates.end_time;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.billable !== undefined) dbUpdates.billable = updates.billable;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { data, error } = await supabase
        .from('work_order_time_entries')
        .update(dbUpdates)
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
