
import { WorkOrder } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { mapWorkOrderToApiFormat, mapApiResponseToWorkOrder } from "./mappers";

/**
 * Get all work orders
 */
export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data?.map(item => mapApiResponseToWorkOrder(item) as WorkOrder) || [];
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return [];
  }
};

/**
 * Get a work order by ID
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return mapApiResponseToWorkOrder(data) as WorkOrder;
  } catch (error) {
    console.error(`Error fetching work order ${id}:`, error);
    return null;
  }
};

/**
 * Create a new work order
 */
export const createWorkOrder = async (workOrder: Partial<WorkOrder>): Promise<WorkOrder | null> => {
  try {
    const workOrderData = mapWorkOrderToApiFormat(workOrder);
    
    const { data, error } = await supabase
      .from('work_orders')
      .insert([workOrderData])
      .select();
      
    if (error) {
      throw error;
    }
    
    return mapApiResponseToWorkOrder(data?.[0]) as WorkOrder;
  } catch (error) {
    console.error('Error creating work order:', error);
    return null;
  }
};

/**
 * Update an existing work order
 */
export const updateWorkOrder = async (id: string, workOrder: Partial<WorkOrder>): Promise<WorkOrder | null> => {
  try {
    const workOrderData = mapWorkOrderToApiFormat(workOrder);
    
    const { data, error } = await supabase
      .from('work_orders')
      .update(workOrderData)
      .eq('id', id)
      .select();
      
    if (error) {
      throw error;
    }
    
    return mapApiResponseToWorkOrder(data?.[0]) as WorkOrder;
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
