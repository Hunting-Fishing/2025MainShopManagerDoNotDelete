
import { WorkOrder } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new work order in the database
 * @param workOrder - Work order data without id and date
 * @returns The created work order with id and date
 */
export async function createWorkOrder(workOrderData: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> {
  try {
    // Generate a new ID and set the date
    const newWorkOrder: WorkOrder = {
      id: uuidv4(),
      date: new Date().toISOString(),
      ...workOrderData
    };
    
    const { data, error } = await supabase
      .from('work_orders')
      .insert(newWorkOrder)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating work order:", error);
      throw new Error(`Failed to create work order: ${error.message}`);
    }
    
    return data as WorkOrder;
  } catch (err) {
    console.error("Error in createWorkOrder:", err);
    throw err;
  }
}
