
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';

export async function getWorkOrderJobLines(workOrderId: string): Promise<WorkOrderJobLine[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching work order job lines:', error);
    throw error;
  }
}

export async function createWorkOrderJobLine(jobLineData: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .insert(jobLineData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating work order job line:', error);
    throw error;
  }
}

export async function updateWorkOrderJobLine(id: string, updates: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating work order job line:', error);
    throw error;
  }
}

export async function upsertWorkOrderJobLine(jobLineData: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .upsert(jobLineData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting work order job line:', error);
    throw error;
  }
}

export async function deleteWorkOrderJobLine(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting work order job line:', error);
    throw error;
  }
}
