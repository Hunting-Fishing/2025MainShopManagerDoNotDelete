
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
  if (!workOrder) return {};
  
  const normalized = { ...workOrder };
  
  // Ensure we have both date and created_at/createdAt
  if (!normalized.date && normalized.created_at) {
    normalized.date = normalized.created_at;
  }
  if (!normalized.date && normalized.createdAt) {
    normalized.date = normalized.createdAt;
  }
  if (!normalized.created_at && normalized.date) {
    normalized.created_at = normalized.date;
  }
  if (!normalized.createdAt && normalized.date) {
    normalized.createdAt = normalized.date;
  }
  
  // Handle technician and technician_id
  if (!normalized.technician && normalized.technician_id) {
    normalized.technician = normalized.technician_id;
  }
  if (!normalized.technician_id && normalized.technician) {
    normalized.technician_id = normalized.technician;
  }
  
  // Handle location (there's no snake_case equivalent for this)
  if (!normalized.location) {
    normalized.location = ""; // Provide a default value
  }
  
  // Handle notes (there's no snake_case equivalent for this)
  if (!normalized.notes) {
    normalized.notes = ""; // Provide a default value
  }
  
  // Handle dueDate
  if (!normalized.dueDate && normalized.due_date) {
    normalized.dueDate = normalized.due_date;
  }
  if (!normalized.due_date && normalized.dueDate) {
    normalized.due_date = normalized.dueDate;
  }
  
  // Handle vehicle info
  if (normalized.vehicle_make && !normalized.vehicleMake) {
    normalized.vehicleMake = normalized.vehicle_make;
  }
  if (normalized.vehicleMake && !normalized.vehicle_make) {
    normalized.vehicle_make = normalized.vehicleMake;
  }
  
  if (normalized.vehicle_model && !normalized.vehicleModel) {
    normalized.vehicleModel = normalized.vehicle_model;
  }
  if (normalized.vehicleModel && !normalized.vehicle_model) {
    normalized.vehicle_model = normalized.vehicleModel;
  }
  
  // Ensure timeEntries exists
  if (!normalized.timeEntries) {
    normalized.timeEntries = [];
  }
  
  // Ensure inventoryItems exists
  if (!normalized.inventoryItems) {
    normalized.inventoryItems = [];
  }
  
  // Ensure totalBillableTime exists
  if (!normalized.totalBillableTime) {
    normalized.totalBillableTime = 0;
  }
  
  return normalized;
};
