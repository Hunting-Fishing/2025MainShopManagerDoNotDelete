
/**
 * Work order utilities for the application
 */
import { WorkOrder } from "@/types/workOrder";
export { formatDate, formatTime, formatTimeInHoursAndMinutes } from "./dateUtils";

// Import priorityMap from utils/workOrders
export { priorityMap, statusMap } from "./workOrders";

/**
 * Normalizes a work order object to ensure consistent property access
 * regardless of different casing conventions (camelCase vs snake_case)
 */
export const normalizeWorkOrder = (workOrder: Partial<WorkOrder>): WorkOrder => {
  if (!workOrder) return {} as WorkOrder;
  
  return {
    ...workOrder,
    // Ensure both camelCase and snake_case versions exist
    customerId: workOrder.customerId || workOrder.customer_id,
    customer_id: workOrder.customer_id || workOrder.customerId,
    technicianId: workOrder.technicianId || workOrder.technician_id,
    technician_id: workOrder.technician_id || workOrder.technicianId,
    vehicleId: workOrder.vehicleId || workOrder.vehicle_id,
    vehicle_id: workOrder.vehicle_id || workOrder.vehicleId,
    serviceType: workOrder.serviceType || workOrder.service_type,
    service_type: workOrder.service_type || workOrder.serviceType,
    serviceCategory: workOrder.serviceCategory || workOrder.service_category,
    service_category: workOrder.service_category || workOrder.serviceCategory,
    totalCost: workOrder.totalCost || workOrder.total_cost,
    total_cost: workOrder.total_cost || workOrder.totalCost,
    estimatedHours: workOrder.estimatedHours || workOrder.estimated_hours,
    estimated_hours: workOrder.estimated_hours || workOrder.estimatedHours,
    vehicleMake: workOrder.vehicleMake || workOrder.vehicle_make,
    vehicle_make: workOrder.vehicle_make || workOrder.vehicleMake,
    vehicleModel: workOrder.vehicleModel || workOrder.vehicle_model,
    vehicle_model: workOrder.vehicle_model || workOrder.vehicleModel,
    vehicleYear: workOrder.vehicleYear || workOrder.vehicle_year,
    vehicle_year: workOrder.vehicle_year || workOrder.vehicleYear,
    // Handle timestamps and dates
    createdAt: workOrder.createdAt || workOrder.created_at,
    created_at: workOrder.created_at || workOrder.createdAt,
    updatedAt: workOrder.updatedAt || workOrder.updated_at || workOrder.lastUpdatedAt,
    updated_at: workOrder.updated_at || workOrder.updatedAt || workOrder.lastUpdatedAt,
    lastUpdatedAt: workOrder.lastUpdatedAt || workOrder.updatedAt || workOrder.updated_at,
  } as WorkOrder;
};
