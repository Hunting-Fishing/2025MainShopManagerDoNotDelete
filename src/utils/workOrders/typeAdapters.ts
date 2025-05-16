
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";

export const normalizeWorkOrderStatus = (status: string): WorkOrderStatusType => {
  const validStatuses: WorkOrderStatusType[] = ["pending", "in-progress", "completed", "cancelled", "on-hold"];
  return validStatuses.includes(status as WorkOrderStatusType) 
    ? status as WorkOrderStatusType 
    : "pending";
};

export const normalizeWorkOrderData = (workOrder: Partial<WorkOrder>): Partial<WorkOrder> => {
  // Create a normalized object that handles both camelCase and snake_case property names
  const normalized: Partial<WorkOrder> = {
    ...workOrder,
    // Handle vehicleYear and vehicle_year inconsistency
    vehicleYear: workOrder.vehicleYear || workOrder.vehicle_year || "",
    vehicle_year: workOrder.vehicle_year || workOrder.vehicleYear || "",
    // Handle other inconsistent field names
    estimatedHours: workOrder.estimatedHours || workOrder.estimated_hours || 0,
    estimated_hours: workOrder.estimated_hours || workOrder.estimatedHours || 0,
    // Handle status normalization
    status: normalizeWorkOrderStatus(workOrder.status || "pending"),
  };

  return normalized;
};
