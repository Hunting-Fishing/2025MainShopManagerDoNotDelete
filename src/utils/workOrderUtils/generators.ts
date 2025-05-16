
import { WorkOrder, WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique work order ID with a prefix
 */
export const generateWorkOrderId = (): string => {
  return `WO-${Date.now().toString().substring(7)}`;
};

/**
 * Create an empty work order with default values
 */
export const createEmptyWorkOrder = (): Partial<WorkOrder> => {
  return {
    id: uuidv4(),
    customer: "",
    description: "",
    status: "pending" as WorkOrderStatusType,
    priority: "medium" as WorkOrderPriorityType,
    date: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    technician: "",
    location: "",
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalBillableTime: 0,
    timeEntries: [],
    inventoryItems: []
  };
};

/**
 * Generate a work order number for display
 */
export const generateWorkOrderNumber = (prefix = "WO", id?: string): string => {
  const timestamp = Date.now().toString().substring(7);
  const uniqueId = id ? id.substring(0, 4) : Math.floor(Math.random() * 1000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${uniqueId}`;
};

/**
 * Calculate the total cost of a work order
 */
export const calculateWorkOrderTotal = (workOrder: Partial<WorkOrder>): number => {
  let total = 0;
  
  // Add inventory items cost
  if (workOrder.inventoryItems && workOrder.inventoryItems.length > 0) {
    total += workOrder.inventoryItems.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
  }
  
  // Add labor cost (assuming a standard $100/hr rate for simplicity)
  if (workOrder.totalBillableTime) {
    // Convert minutes to hours and multiply by rate
    const laborRate = 100;
    const hours = workOrder.totalBillableTime / 60;
    total += hours * laborRate;
  }
  
  return total;
};

/**
 * Calculate the estimated completion time based on tasks
 */
export const calculateEstimatedCompletion = (
  estimatedHours: number | undefined,
  startDate: Date | string | undefined
): string | null => {
  if (!estimatedHours || !startDate) return null;
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const endDate = new Date(start);
  endDate.setHours(endDate.getHours() + estimatedHours);
  
  return endDate.toISOString();
};
