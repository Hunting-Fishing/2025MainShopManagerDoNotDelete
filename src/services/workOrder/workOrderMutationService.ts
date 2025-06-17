
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

export async function createWorkOrder(workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .insert(workOrderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
}

export async function updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating work order:', error);
    throw error;
  }
}

export async function updateWorkOrderStatus(id: string, status: string): Promise<WorkOrder> {
  return updateWorkOrder(id, { status });
}

export async function deleteWorkOrder(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting work order:', error);
    throw error;
  }
}
