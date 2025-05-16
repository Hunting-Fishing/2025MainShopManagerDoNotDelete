
import { WorkOrder } from "@/types/workOrder";

// Format a date string
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Format a time string
export const formatTime = (timeString: string): string => {
  if (!timeString) return 'N/A';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error("Error formatting time:", error);
    return 'Invalid Time';
  }
};

// Format time in hours and minutes
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  if (!minutes) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

// Normalize a work order by ensuring all required fields are present
export const normalizeWorkOrder = (order: any): WorkOrder => {
  return {
    id: order.id || '',
    customer: order.customer || '',
    customer_id: order.customer_id,
    vehicle_id: order.vehicle_id,
    description: order.description || '',
    status: order.status || 'pending',
    priority: order.priority || 'medium',
    date: order.date || order.created_at || new Date().toISOString(),
    dueDate: order.due_date,
    technician: order.technician || '',
    technician_id: order.technician_id,
    location: order.location || '',
    notes: order.notes || '',
    totalBillableTime: order.total_billable_time || 0,
    created_by: order.created_by || '',
    createdAt: order.created_at || new Date().toISOString(),
    last_updated_by: order.last_updated_by || '',
    lastUpdatedAt: order.last_updated_at,
    timeEntries: [],
    inventoryItems: []
  };
};
