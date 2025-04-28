
import { WorkOrder } from "@/types/workOrder";
import { format, parseISO } from 'date-fns';
import { normalizeWorkOrder } from "./workOrders/formatters";

/**
 * Formats a date string into a readable format
 */
export const formatDate = (date: string | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(parseISO(date), 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Formats money value to currency string
 */
export const formatMoney = (amount: number | undefined | null): string => {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Get color class for status badge
 */
export const getStatusColorClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get color class for priority badges
 */
export const getPriorityColorClass = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Normalize work order object to ensure consistent property access
 */
export const normalizeWorkOrderObject = (workOrder: WorkOrder): WorkOrder => {
  return normalizeWorkOrder(workOrder);
};
