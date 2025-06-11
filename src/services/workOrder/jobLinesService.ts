
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';

export const getWorkOrderJobLines = async (workOrderId: string): Promise<WorkOrderJobLine[]> => {
  const { data, error } = await supabase
    .rpc('get_work_order_job_lines', { work_order_id_param: workOrderId });

  if (error) {
    console.error('Error fetching work order job lines:', error);
    throw error;
  }

  return data?.map((jobLine: any) => ({
    id: jobLine.id,
    workOrderId: jobLine.work_order_id,
    name: jobLine.name,
    category: jobLine.category,
    subcategory: jobLine.subcategory,
    description: jobLine.description,
    estimatedHours: jobLine.estimated_hours,
    laborRate: jobLine.labor_rate,
    totalAmount: jobLine.total_amount,
    status: jobLine.status as 'pending' | 'in-progress' | 'completed' | 'on-hold',
    notes: jobLine.notes,
    createdAt: jobLine.created_at,
    updatedAt: jobLine.updated_at,
    parts: [] // Parts will be loaded separately and attached
  })) || [];
};

export const saveWorkOrderJobLines = async (
  workOrderId: string, 
  jobLines: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<boolean> => {
  try {
    // Delete existing job lines for this work order
    await supabase.rpc('delete_work_order_job_lines', { 
      work_order_id_param: workOrderId 
    });

    // Insert new job lines
    for (let i = 0; i < jobLines.length; i++) {
      const jobLine = jobLines[i];
      await supabase.rpc('upsert_work_order_job_line', {
        p_id: null, // Let the function generate a new ID
        p_work_order_id: workOrderId,
        p_name: jobLine.name,
        p_category: jobLine.category || null,
        p_subcategory: jobLine.subcategory || null,
        p_description: jobLine.description || null,
        p_estimated_hours: jobLine.estimatedHours || 0,
        p_labor_rate: jobLine.laborRate || 0,
        p_total_amount: jobLine.totalAmount || 0,
        p_status: jobLine.status,
        p_notes: jobLine.notes || null,
        p_display_order: i
      });
    }

    return true;
  } catch (error) {
    console.error('Error saving work order job lines:', error);
    return false;
  }
};

export const deleteWorkOrderJobLine = async (jobLineId: string): Promise<boolean> => {
  try {
    await supabase.rpc('delete_work_order_job_line', { 
      job_line_id_param: jobLineId 
    });
    return true;
  } catch (error) {
    console.error('Error deleting work order job line:', error);
    return false;
  }
};
