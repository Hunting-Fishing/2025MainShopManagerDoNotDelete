
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
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderJobLines:', error);
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
        name: jobLineData.name,
        category: jobLineData.category,
        subcategory: jobLineData.subcategory,
        description: jobLineData.description,
        estimated_hours: jobLineData.estimated_hours || 0,
        labor_rate: jobLineData.labor_rate || 0,
        labor_rate_type: jobLineData.labor_rate_type || 'standard',
        total_amount: (jobLineData.estimated_hours || 0) * (jobLineData.labor_rate || 0),
        status: jobLineData.status || 'pending',
        notes: jobLineData.notes,
        display_order: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job line:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createWorkOrderJobLine:', error);
    throw error;
  }
}

export async function updateWorkOrderJobLine(
  jobLineId: string,
  jobLineData: Partial<WorkOrderJobLine>
): Promise<WorkOrderJobLine> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .update({
        name: jobLineData.name,
        category: jobLineData.category,
        subcategory: jobLineData.subcategory,
        description: jobLineData.description,
        estimated_hours: jobLineData.estimated_hours,
        labor_rate: jobLineData.labor_rate,
        labor_rate_type: jobLineData.labor_rate_type,
        total_amount: jobLineData.total_amount,
        status: jobLineData.status,
        notes: jobLineData.notes,
        display_order: jobLineData.display_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobLineId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job line:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateWorkOrderJobLine:', error);
    throw error;
  }
}

export async function upsertWorkOrderJobLine(
  workOrderId: string,
  jobLineData: Partial<WorkOrderJobLine>
): Promise<WorkOrderJobLine> {
  try {
    if (jobLineData.id) {
      return await updateWorkOrderJobLine(jobLineData.id, jobLineData);
    } else {
      return await createWorkOrderJobLine(workOrderId, jobLineData as JobLineFormValues);
    }
  } catch (error) {
    console.error('Error in upsertWorkOrderJobLine:', error);
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
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderJobLine:', error);
    throw error;
  }
}
