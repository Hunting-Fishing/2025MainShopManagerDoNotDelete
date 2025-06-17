
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

/**
 * Work order parts service
 */
export const workOrderPartsService = {
  /**
   * Get all parts for a work order
   */
  async getByWorkOrderId(workOrderId: string): Promise<WorkOrderPart[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }
  },

  /**
   * Get parts for a specific job line
   */
  async getByJobLineId(jobLineId: string): Promise<WorkOrderPart[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('job_line_id', jobLineId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }
  },

  /**
   * Create new part
   */
  async create(partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .insert(partData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }
  },

  /**
   * Update part
   */
  async update(id: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }
  },

  /**
   * Delete part
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_order_parts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }
  }
};
