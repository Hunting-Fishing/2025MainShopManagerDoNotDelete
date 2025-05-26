
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

/**
 * Create a new work order
 */
export const createWorkOrder = async (workOrder: Partial<WorkOrder>): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .insert([workOrder])
      .select();
      
    if (error) {
      throw error;
    }
    
    return normalizeWorkOrder(data?.[0]);
  } catch (error) {
    console.error('Error creating work order:', error);
    return null;
  }
};

/**
 * Update an existing work order
 */
export const updateWorkOrder = async (workOrder: Partial<WorkOrder>): Promise<WorkOrder | null> => {
  try {
    if (!workOrder.id) {
      throw new Error('Work order ID is required for update');
    }
    
    const { data, error } = await supabase
      .from('work_orders')
      .update(workOrder)
      .eq('id', workOrder.id)
      .select();
      
    if (error) {
      throw error;
    }
    
    return normalizeWorkOrder(data?.[0]);
  } catch (error) {
    console.error('Error updating work order:', error);
    return null;
  }
};

/**
 * Delete a work order by ID
 */
export const deleteWorkOrder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting work order ${id}:`, error);
    return false;
  }
};

/**
 * Update work order status
 */
export const updateWorkOrderStatus = async (id: string, status: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
      
    if (error) {
      throw error;
    }
    
    return normalizeWorkOrder(data?.[0]);
  } catch (error) {
    console.error(`Error updating work order status ${id}:`, error);
    return null;
  }
};
