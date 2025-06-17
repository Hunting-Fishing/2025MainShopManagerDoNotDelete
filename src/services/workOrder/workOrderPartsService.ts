
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching work order parts:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching job line parts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
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
}

export async function updateWorkOrderPart(id: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating work order part:', error);
    throw error;
  }
}

export async function deleteWorkOrderPart(id: string): Promise<void> {
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
