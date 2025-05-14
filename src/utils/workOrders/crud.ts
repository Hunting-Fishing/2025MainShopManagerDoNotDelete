
import { WorkOrder } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { normalizeWorkOrder } from './formatters';

// Re-export the WorkOrder type to ensure it's available where needed
export { WorkOrder } from "@/types/workOrder";

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
    
    return data?.map(normalizeWorkOrder) || [];
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
    
    return normalizeWorkOrder(data);
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
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician')
      .not('technician', 'is', null);
      
    if (error) {
      throw error;
    }
    
    // Filter out nulls and duplicates
    return [...new Set(data?.map(item => item.technician).filter(Boolean))];
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return [];
  }
};
