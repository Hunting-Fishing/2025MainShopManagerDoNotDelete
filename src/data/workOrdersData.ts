
import { WorkOrder } from "@/types/workOrder";
import { getAllWorkOrders, getWorkOrderById } from "@/services/workOrder";
import { priorityMap } from "@/utils/workOrders";

// Use 'export type' instead of just 'export' for types when isolatedModules is enabled
export type { WorkOrder } from "@/types/workOrder";
export { priorityMap } from "@/utils/workOrders";

// Function to fetch all work orders from the database - now using centralized service
export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    return await getAllWorkOrders();
  } catch (error: any) {
    console.error("Unexpected error fetching work orders:", error);
    throw new Error(`Unexpected error fetching work orders: ${error.message}`);
  }
};

// Function to fetch a single work order by ID from the database - now using centralized service
export const fetchWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    return await getWorkOrderById(id);
  } catch (error: any) {
    console.error("Unexpected error fetching work order by ID:", error);
    throw new Error(`Unexpected error fetching work order by ID: ${error.message}`);
  }
};
