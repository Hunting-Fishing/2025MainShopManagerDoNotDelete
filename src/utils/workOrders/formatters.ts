
import { WorkOrder } from "@/types/workOrder";

/**
 * Ensures a WorkOrder object has consistent property access regardless of camelCase or snake_case
 * This is used as a temporary solution while transitioning the codebase
 */
export function normalizeWorkOrder(workOrder: WorkOrder): WorkOrder {
  const normalized = { ...workOrder };

  // Convert snake_case to camelCase
  if (normalized.customer_id !== undefined && normalized.customerId === undefined) {
    normalized.customerId = normalized.customer_id;
  }
  
  if (normalized.technician_id !== undefined && normalized.technicianId === undefined) {
    normalized.technicianId = normalized.technician_id;
  }
  
  if (normalized.vehicle_id !== undefined && normalized.vehicleId === undefined) {
    normalized.vehicleId = normalized.vehicle_id;
  }
  
  if (normalized.vehicle_make !== undefined && normalized.vehicleMake === undefined) {
    normalized.vehicleMake = normalized.vehicle_make;
  }
  
  if (normalized.vehicle_model !== undefined && normalized.vehicleModel === undefined) {
    normalized.vehicleModel = normalized.vehicle_model;
  }
  
  if (normalized.vehicle_year !== undefined && normalized.vehicleYear === undefined) {
    normalized.vehicleYear = normalized.vehicle_year;
  }
  
  if (normalized.service_type !== undefined && normalized.serviceType === undefined) {
    normalized.serviceType = normalized.service_type;
  }
  
  if (normalized.service_category !== undefined && normalized.serviceCategory === undefined) {
    normalized.serviceCategory = normalized.service_category;
  }
  
  if (normalized.total_cost !== undefined && normalized.totalCost === undefined) {
    normalized.totalCost = normalized.total_cost;
  }
  
  if (normalized.created_at !== undefined && normalized.createdAt === undefined) {
    normalized.createdAt = normalized.created_at;
  }
  
  if (normalized.updated_at !== undefined && normalized.updatedAt === undefined) {
    normalized.updatedAt = normalized.updated_at;
  }
  
  // Ensure backwards compatibility
  if (normalized.updatedAt !== undefined && normalized.lastUpdatedAt === undefined) {
    normalized.lastUpdatedAt = normalized.updatedAt;
  }

  return normalized;
}

/**
 * Format time in hours and minutes
 */
export function formatTimeInHoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${mins} min`;
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
