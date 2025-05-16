
import { WorkOrder, WorkOrderInventoryItem, WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";

/**
 * Maps a work order object to a format suitable for API requests
 */
export const mapWorkOrderToApiFormat = (workOrder: Partial<WorkOrder>): Record<string, any> => {
  return {
    id: workOrder.id,
    customer: workOrder.customer,
    customer_id: workOrder.customer_id,
    vehicle_id: workOrder.vehicle_id,
    description: workOrder.description,
    status: workOrder.status,
    priority: workOrder.priority,
    date: workOrder.date,
    due_date: workOrder.dueDate,
    technician: workOrder.technician,
    technician_id: workOrder.technician_id,
    location: workOrder.location,
    notes: workOrder.notes,
    total_billable_time: workOrder.totalBillableTime,
    created_at: workOrder.createdAt,
    updated_at: workOrder.updatedAt,
  };
};

/**
 * Maps API response to work order format used in application
 */
export const mapApiResponseToWorkOrder = (data: any): Partial<WorkOrder> => {
  return {
    id: data.id,
    customer: data.customer,
    customer_id: data.customer_id,
    vehicle_id: data.vehicle_id,
    description: data.description,
    status: data.status as WorkOrderStatusType,
    priority: data.priority as WorkOrderPriorityType,
    date: data.date,
    dueDate: data.due_date,
    technician: data.technician,
    technician_id: data.technician_id,
    location: data.location,
    notes: data.notes,
    totalBillableTime: data.total_billable_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * Maps inventory items from API to work order inventory format
 */
export const mapApiInventoryToWorkOrder = (items: any[]): WorkOrderInventoryItem[] => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.unit_price * item.quantity,
  }));
};

/**
 * Groups work orders by status for dashboard display
 */
export const groupWorkOrdersByStatus = (
  workOrders: WorkOrder[]
): Record<WorkOrderStatusType, WorkOrder[]> => {
  const grouped: Record<WorkOrderStatusType, WorkOrder[]> = {
    "pending": [],
    "in-progress": [],
    "on-hold": [],
    "completed": [],
    "cancelled": []
  };
  
  workOrders.forEach(workOrder => {
    if (workOrder.status in grouped) {
      grouped[workOrder.status].push(workOrder);
    } else {
      // Default to pending if status is unknown
      grouped["pending"].push(workOrder);
    }
  });
  
  return grouped;
};
