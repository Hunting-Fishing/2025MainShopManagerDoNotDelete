
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching work order parts:', error);
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

export async function createWorkOrderPart(part: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderPart> {
  try {
    const partData = {
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id || null,
      part_number: part.part_number,
      name: part.name,
      description: part.description || null,
      quantity: part.quantity,
      unit_price: part.unit_price,
      total_price: part.total_price,
      status: part.status || 'pending',
      notes: part.notes || null
    };

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert([partData])
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    return data as WorkOrderPart;
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    return data as WorkOrderPart;
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
      console.error('Error deleting work order part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}
