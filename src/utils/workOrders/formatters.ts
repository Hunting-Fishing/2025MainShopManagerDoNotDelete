
/**
 * Format a date string to a localized format
 */
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${mins} min`;
  }
};

/**
 * Format a date string to a localized format
 */
export const formatDate = (date: string | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

/**
 * Format a time string (for display purposes)
 */
export const formatTime = (time: string | undefined): string => {
  if (!time) return '';
  const timeDate = time ? new Date(time) : null;
  return timeDate ? timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
};

/**
 * Normalize a work order object to ensure consistent property access
 * This handles both camelCase and snake_case properties
 */
export const normalizeWorkOrder = (workOrder: any): any => {
  const normalized = { ...workOrder };
  
  // Ensure both camelCase and snake_case versions of keys exist
  if (workOrder.customerId && !workOrder.customer_id) {
    normalized.customer_id = workOrder.customerId;
  } else if (workOrder.customer_id && !workOrder.customerId) {
    normalized.customerId = workOrder.customer_id;
  }
  
  if (workOrder.technicianId && !workOrder.technician_id) {
    normalized.technician_id = workOrder.technicianId;
  } else if (workOrder.technician_id && !workOrder.technicianId) {
    normalized.technicianId = workOrder.technician_id;
  }
  
  if (workOrder.vehicleId && !workOrder.vehicle_id) {
    normalized.vehicle_id = workOrder.vehicleId;
  } else if (workOrder.vehicle_id && !workOrder.vehicleId) {
    normalized.vehicleId = workOrder.vehicle_id;
  }
  
  if (workOrder.createdAt && !workOrder.created_at) {
    normalized.created_at = workOrder.createdAt;
  } else if (workOrder.created_at && !workOrder.createdAt) {
    normalized.createdAt = workOrder.created_at;
  }
  
  if (workOrder.updatedAt && !workOrder.updated_at) {
    normalized.updated_at = workOrder.updatedAt;
  } else if (workOrder.updated_at && !workOrder.updatedAt) {
    normalized.updatedAt = workOrder.updated_at;
  }
  
  if (workOrder.lastUpdatedAt && !workOrder.updated_at) {
    normalized.updated_at = workOrder.lastUpdatedAt;
  } else if (workOrder.updated_at && !workOrder.lastUpdatedAt) {
    normalized.lastUpdatedAt = workOrder.updated_at;
  }
  
  // Handle vehicle make/model properties
  if (workOrder.vehicleMake && !workOrder.vehicle_make) {
    normalized.vehicle_make = workOrder.vehicleMake;
  } else if (workOrder.vehicle_make && !workOrder.vehicleMake) {
    normalized.vehicleMake = workOrder.vehicle_make;
  }
  
  if (workOrder.vehicleModel && !workOrder.vehicle_model) {
    normalized.vehicle_model = workOrder.vehicleModel;
  } else if (workOrder.vehicle_model && !workOrder.vehicleModel) {
    normalized.vehicleModel = workOrder.vehicle_model;
  }
  
  // Handle financial info
  if (workOrder.totalCost !== undefined && workOrder.total_cost === undefined) {
    normalized.total_cost = workOrder.totalCost;
  } else if (workOrder.total_cost !== undefined && workOrder.totalCost === undefined) {
    normalized.totalCost = workOrder.total_cost;
  }
  
  // Handle service info
  if (workOrder.serviceType && !workOrder.service_type) {
    normalized.service_type = workOrder.serviceType;
  } else if (workOrder.service_type && !workOrder.serviceType) {
    normalized.serviceType = workOrder.service_type;
  }
  
  if (workOrder.serviceCategory && !workOrder.service_category) {
    normalized.service_category = workOrder.serviceCategory;
  } else if (workOrder.service_category && !workOrder.serviceCategory) {
    normalized.serviceCategory = workOrder.service_category;
  }
  
  if (workOrder.estimatedHours !== undefined && workOrder.estimated_hours === undefined) {
    normalized.estimated_hours = workOrder.estimatedHours;
  } else if (workOrder.estimated_hours !== undefined && workOrder.estimatedHours === undefined) {
    normalized.estimatedHours = workOrder.estimated_hours;
  }
  
  return normalized;
};

// Removed the duplicate export here that was causing the issue
