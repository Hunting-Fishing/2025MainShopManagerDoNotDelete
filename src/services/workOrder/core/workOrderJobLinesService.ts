
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';

/**
 * Work order job lines service
 */
export const workOrderJobLinesService = {
  /**
   * Get all job lines for a work order
   */
  async getByWorkOrderId(workOrderId: string): Promise<WorkOrderJobLine[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_job_lines')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job lines:', error);
      throw error;
    }
  },

  /**
   * Create new job line
   */
  async create(jobLineData: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
    try {
      const { data, error } = await supabase
        .from('work_order_job_lines')
        .insert(jobLineData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating job line:', error);
      throw error;
    }
  },

  /**
   * Update job line
   */
  async update(id: string, updates: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
    try {
      const { data, error } = await supabase
        .from('work_order_job_lines')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating job line:', error);
      throw error;
    }
  },

  /**
   * Delete job line
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_order_job_lines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting job line:', error);
      throw error;
    }
  }
};
