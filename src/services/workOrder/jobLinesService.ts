
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';

/**
 * Get all job lines for a work order
 */
export async function getWorkOrderJobLines(workOrderId: string): Promise<WorkOrderJobLine[]> {
  try {
    console.log('getWorkOrderJobLines: Fetching job lines for work order:', workOrderId);
    
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('getWorkOrderJobLines: Error:', error);
      throw error;
    }

    console.log('getWorkOrderJobLines: Successfully fetched job lines:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('getWorkOrderJobLines: Failed to fetch job lines:', error);
    throw error;
  }
}

/**
 * Create or update a job line
 */
export async function upsertWorkOrderJobLine(jobLine: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
  try {
    console.log('upsertWorkOrderJobLine: Upserting job line:', jobLine);
    
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .upsert({
        id: jobLine.id,
        work_order_id: jobLine.work_order_id,
        name: jobLine.name,
        category: jobLine.category,
        subcategory: jobLine.subcategory,
        description: jobLine.description,
        estimated_hours: jobLine.estimated_hours,
        labor_rate: jobLine.labor_rate,
        total_amount: jobLine.total_amount,
        status: jobLine.status || 'pending',
        notes: jobLine.notes,
        display_order: jobLine.display_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('upsertWorkOrderJobLine: Error:', error);
      throw error;
    }

    console.log('upsertWorkOrderJobLine: Successfully upserted job line:', data);
    return data;
  } catch (error) {
    console.error('upsertWorkOrderJobLine: Failed to upsert job line:', error);
    throw error;
  }
}

/**
 * Delete a job line
 */
export async function deleteWorkOrderJobLine(jobLineId: string): Promise<void> {
  try {
    console.log('deleteWorkOrderJobLine: Deleting job line:', jobLineId);
    
    const { error } = await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('id', jobLineId);

    if (error) {
      console.error('deleteWorkOrderJobLine: Error:', error);
      throw error;
    }

    console.log('deleteWorkOrderJobLine: Successfully deleted job line');
  } catch (error) {
    console.error('deleteWorkOrderJobLine: Failed to delete job line:', error);
    throw error;
  }
}
