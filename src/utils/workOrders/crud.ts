
import { supabase } from "@/lib/supabase";
import { WorkOrder } from "@/types/workOrder";

/**
 * Creates a new work order
 */
export const createWorkOrder = async (workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
  // Format the data for database insertion
  const formattedData = {
    ...workOrderData,
    // Convert camelCase to snake_case for database fields
    customer_id: workOrderData.customer_id,
    due_date: workOrderData.dueDate,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // If technician field has a name, we need to properly handle this
    // For now, we're saving the name directly
  };

  const { data, error } = await supabase
    .from('work_orders')
    .insert([formattedData])
    .select()
    .single();

  if (error) {
    console.error("Error creating work order:", error);
    throw error;
  }

  return data;
};

/**
 * Fetches a work order by ID
 */
export const getWorkOrder = async (id: string): Promise<WorkOrder | null> => {
  const { data, error } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching work order:", error);
    throw error;
  }

  return data;
};

/**
 * Updates an existing work order
 */
export const updateWorkOrder = async (id: string, workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
  const formattedData = {
    ...workOrderData,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('work_orders')
    .update(formattedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating work order:", error);
    throw error;
  }

  return data;
};

/**
 * Deletes a work order
 */
export const deleteWorkOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('work_orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting work order:", error);
    throw error;
  }
};
