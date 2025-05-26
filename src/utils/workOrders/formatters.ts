
import { WorkOrder } from "@/types/workOrder";

/**
 * Format date to a readable string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

/**
 * Format time to a readable string
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleTimeString();
};

/**
 * Format time duration in hours and minutes
 */
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  if (!minutes) return '0 minutes';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} minutes`;
  if (mins === 0) return `${hours} hours`;
  return `${hours}h ${mins}m`;
};

/**
 * Normalize work order data from database
 */
export const normalizeWorkOrder = (data: any): WorkOrder => {
  return {
    id: data.id,
    customer_id: data.customer_id,
    vehicle_id: data.vehicle_id,
    technician_id: data.technician_id,
    status: data.status,
    description: data.description,
    service_type: data.service_type,
    estimated_hours: data.estimated_hours,
    total_cost: data.total_cost,
    created_at: data.created_at,
    updated_at: data.updated_at,
    start_time: data.start_time,
    end_time: data.end_time,
    service_category_id: data.service_category_id,
    invoice_id: data.invoice_id,
    invoiced_at: data.invoiced_at,
    
    // Legacy fields for backward compatibility
    customer: data.customer || '',
    technician: data.technician || '',
    priority: data.priority || 'medium',
    date: data.created_at,
    dueDate: data.end_time || data.created_at,
    location: data.location || '',
    notes: data.description || '',
    timeEntries: [],
    inventoryItems: []
  };
};

/**
 * Calculate total time from time entries
 */
export const calculateTotalTime = (timeEntries: any[]): number => {
  return timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
};

/**
 * Calculate billable time from time entries
 */
export const calculateBillableTime = (timeEntries: any[]): number => {
  return timeEntries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + (entry.duration || 0), 0);
};
