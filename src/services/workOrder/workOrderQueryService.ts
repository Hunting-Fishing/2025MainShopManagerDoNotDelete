
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

/**
 * Get all work orders
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
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
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data?.map(normalizeWorkOrder) || [];
  } catch (error) {
    console.error(`Error fetching work orders for customer ${customerId}:`, error);
    return [];
  }
};

/**
 * Get work orders by status
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data?.map(normalizeWorkOrder) || [];
  } catch (error) {
    console.error(`Error fetching work orders with status ${status}:`, error);
    return [];
  }
};

/**
 * Get unique technicians from work orders - using technician_id instead of technician
 */
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);
      
    if (error) {
      throw error;
    }
    
    // Filter out nulls and duplicates
    return [...new Set(data?.map(item => item.technician_id).filter(Boolean))];
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return [];
  }
};
