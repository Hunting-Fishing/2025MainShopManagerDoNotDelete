
import { supabase } from "@/lib/supabase";
import { WorkOrder } from "@/types/workOrder";
import { mapDatabaseToAppModel, mapAppModelToDatabase } from "./mappers";

/**
 * Creates a new work order
 */
export const createWorkOrder = async (workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
  // Format the data for database insertion
  const formattedData = mapAppModelToDatabase(workOrderData);

  const { data, error } = await supabase
    .from('work_orders')
    .insert([formattedData])
    .select()
    .single();

  if (error) {
    console.error("Error creating work order:", error);
    throw error;
  }

  return mapDatabaseToAppModel(data);
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

  return mapDatabaseToAppModel(data);
};

/**
 * Find a work order by ID with all related data
 */
export const findWorkOrderById = async (id: string, options: any = {}): Promise<WorkOrder | null> => {
  try {
    // Get work order with time entries
    const { data: workOrderData, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        work_order_time_entries(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }

    if (!workOrderData) {
      return null;
    }

    // Fetch customer and technician data separately to avoid relationship issues
    let customerData = null;
    if (workOrderData.customer_id) {
      const { data } = await supabase
        .from('customers')
        .select('first_name, last_name')
        .eq('id', workOrderData.customer_id)
        .single();
      customerData = data;
    }

    // Get technician data if available
    let technicianData = null;
    if (workOrderData.technician_id) {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', workOrderData.technician_id)
        .single();
      technicianData = data;
    }

    // Combine all data
    const workOrderWithDetails = {
      ...workOrderData,
      customers: customerData,
      profiles: technicianData
    };
    
    // Map database model to application model
    return mapDatabaseToAppModel(workOrderWithDetails);
  } catch (error) {
    console.error("Error finding work order by ID:", error);
    throw error;
  }
};

/**
 * Updates an existing work order
 */
export const updateWorkOrder = async (workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
  const id = workOrderData.id;
  if (!id) {
    throw new Error("Work order ID is required for updates");
  }
  
  const formattedData = mapAppModelToDatabase(workOrderData);
  formattedData.updated_at = new Date().toISOString();

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

  return mapDatabaseToAppModel(data);
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
