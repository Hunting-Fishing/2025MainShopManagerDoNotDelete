
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching parts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(
  workOrderId: string,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
        job_line_id: partData.job_line_id,
        name: partData.name,
        part_number: partData.part_number,
        description: partData.description,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        total_price: partData.quantity * partData.unit_price,
        status: partData.status || 'pending',
        notes: partData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating part:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(
  partId: string,
  partData: Partial<WorkOrderPart>
): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        name: partData.name,
        part_number: partData.part_number,
        description: partData.description,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        total_price: partData.total_price,
        status: partData.status,
        notes: partData.notes,
        job_line_id: partData.job_line_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating part:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}
