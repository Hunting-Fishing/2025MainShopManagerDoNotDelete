
import { WorkOrder } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

// Use 'export type' instead of just 'export' for types when isolatedModules is enabled
export type { WorkOrder } from "@/types/workOrder";
export { priorityMap } from "@/utils/workOrders";

// Function to fetch all work orders from the database
export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching work orders:", error);
      throw new Error(`Error fetching work orders: ${error.message}`);
    }

    // Normalize the data before returning
    return data.map(normalizeWorkOrder);
  } catch (error: any) {
    console.error("Unexpected error fetching work orders:", error);
    throw new Error(`Unexpected error fetching work orders: ${error.message}`);
  }
};

// Function to fetch a single work order by ID from the database
export const fetchWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Check if the error is a "not found" error
      if (error.message.includes('No rows found')) {
        return null; // Return null for not found
      }
      console.error("Error fetching work order by ID:", error);
      throw new Error(`Error fetching work order by ID: ${error.message}`);
    }

    // Normalize the data before returning
    return normalizeWorkOrder(data);
  } catch (error: any) {
    console.error("Unexpected error fetching work order by ID:", error);
    throw new Error(`Unexpected error fetching work order by ID: ${error.message}`);
  }
};
