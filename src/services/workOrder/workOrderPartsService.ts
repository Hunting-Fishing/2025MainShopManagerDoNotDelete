
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
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(
  workOrderId: string,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  try {
    const totalPrice = partData.quantity * partData.unit_price;
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number,
        name: partData.name,
        description: partData.description,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        total_price: totalPrice,
        status: partData.status || 'pending',
        notes: partData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
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
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  try {
    const totalPrice = partData.quantity * partData.unit_price;
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        part_number: partData.part_number,
        name: partData.name,
        description: partData.description,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        total_price: totalPrice,
        status: partData.status,
        notes: partData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
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
      console.error('Error deleting work order part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}
