
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine, JobLineFormValues } from '@/types/jobLine';

export async function getWorkOrderJobLines(workOrderId: string): Promise<WorkOrderJobLine[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching job lines:', error);
      throw new Error(`Failed to fetch job lines: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getWorkOrderJobLines:', error);
    throw error;
  }
}

export async function createWorkOrderJobLine(
  workOrderId: string, 
  jobLineData: JobLineFormValues
): Promise<WorkOrderJobLine> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .insert({
        work_order_id: workOrderId,
        ...jobLineData
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating job line:', error);
      throw new Error(`Failed to create job line: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Exception in createWorkOrderJobLine:', error);
    throw error;
  }
}

export async function updateWorkOrderJobLine(jobLine: WorkOrderJobLine): Promise<WorkOrderJobLine> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .update({
        name: jobLine.name,
        category: jobLine.category,
        subcategory: jobLine.subcategory,
        description: jobLine.description,
        estimated_hours: jobLine.estimated_hours,
        labor_rate: jobLine.labor_rate,
        labor_rate_type: jobLine.labor_rate_type,
        total_amount: jobLine.total_amount,
        status: jobLine.status,
        notes: jobLine.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobLine.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating job line:', error);
      throw new Error(`Failed to update job line: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Exception in updateWorkOrderJobLine:', error);
    throw error;
  }
}

export async function deleteWorkOrderJobLine(jobLineId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('id', jobLineId);

    if (error) {
      console.error('Error deleting job line:', error);
      throw new Error(`Failed to delete job line: ${error.message}`);
    }
  } catch (error) {
    console.error('Exception in deleteWorkOrderJobLine:', error);
    throw error;
  }
}
