
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';

export async function loadJobLinesFromDatabase(workOrderId: string): Promise<WorkOrderJobLine[]> {
  try {
    console.log('Loading job lines for work order:', workOrderId);
    
    const { data, error } = await supabase.rpc('get_work_order_job_lines', {
      work_order_id_param: workOrderId
    });

    if (error) {
      console.error('Database error loading job lines:', error);
      throw error;
    }

    const jobLines = (data || []).map((item: any): WorkOrderJobLine => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      description: item.description,
      estimatedHours: item.estimated_hours,
      laborRate: item.labor_rate,
      totalAmount: item.total_amount,
      status: item.status as WorkOrderJobLine['status'],
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    console.log(`Loaded ${jobLines.length} job lines from database`);
    return jobLines;
  } catch (error) {
    console.error('Error loading job lines from database:', error);
    throw new Error('Failed to load job lines from database');
  }
}

export async function saveJobLinesToDatabase(workOrderId: string, jobLines: WorkOrderJobLine[]): Promise<void> {
  try {
    console.log(`Saving ${jobLines.length} job lines for work order:`, workOrderId);
    
    // First, delete existing job lines for this work order
    const { error: deleteError } = await supabase.rpc('delete_work_order_job_lines', {
      work_order_id_param: workOrderId
    });

    if (deleteError) {
      console.error('Error deleting existing job lines:', deleteError);
      throw deleteError;
    }

    // Then insert all the new job lines
    for (let i = 0; i < jobLines.length; i++) {
      const jobLine = jobLines[i];
      console.log(`Saving job line ${i + 1}/${jobLines.length}:`, jobLine.name);
      
      const { error } = await supabase.rpc('upsert_work_order_job_line', {
        p_id: jobLine.id,
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

      if (error) {
        console.error(`Error saving job line ${i + 1}:`, error);
        throw error;
      }
    }

    console.log('Successfully saved all job lines to database');
  } catch (error) {
    console.error('Error saving job lines to database:', error);
    throw new Error('Failed to save job lines to database');
  }
}

export async function deleteJobLineFromDatabase(jobLineId: string): Promise<void> {
  try {
    console.log('Deleting job line from database:', jobLineId);
    
    const { error } = await supabase.rpc('delete_work_order_job_line', {
      job_line_id_param: jobLineId
    });

    if (error) {
      console.error('Error deleting job line:', error);
      throw error;
    }

    console.log('Successfully deleted job line from database');
  } catch (error) {
    console.error('Error deleting job line from database:', error);
    throw new Error('Failed to delete job line from database');
  }
}

// Generate a temporary ID for new job lines
export function generateTempJobLineId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
