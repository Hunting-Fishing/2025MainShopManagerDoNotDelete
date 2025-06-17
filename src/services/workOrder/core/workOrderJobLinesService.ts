
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
      // Ensure required fields are present
      const dbData = {
        work_order_id: jobLineData.work_order_id!,
        name: jobLineData.name || 'Unnamed Job Line',
        category: jobLineData.category,
        subcategory: jobLineData.subcategory,
        description: jobLineData.description,
        estimated_hours: jobLineData.estimated_hours || 0,
        labor_rate: jobLineData.labor_rate || 0,
        labor_rate_type: jobLineData.labor_rate_type || 'standard',
        total_amount: jobLineData.total_amount || 0,
        status: jobLineData.status || 'pending',
        notes: jobLineData.notes,
        display_order: jobLineData.display_order || 0
      };

      const { data, error } = await supabase
        .from('work_order_job_lines')
        .insert(dbData)
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
      // Map updates to database schema
      const dbUpdates = {
        name: updates.name,
        category: updates.category,
        subcategory: updates.subcategory,
        description: updates.description,
        estimated_hours: updates.estimated_hours,
        labor_rate: updates.labor_rate,
        labor_rate_type: updates.labor_rate_type,
        total_amount: updates.total_amount,
        status: updates.status,
        notes: updates.notes,
        display_order: updates.display_order,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      const { data, error } = await supabase
        .from('work_order_job_lines')
        .update(dbUpdates)
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
