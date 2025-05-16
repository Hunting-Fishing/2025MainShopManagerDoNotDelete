
import { TimeEntry } from "@/types/workOrder";
import { format } from "date-fns";

// Format time in hours and minutes
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

// Calculate total time from time entries
export const calculateTotalTime = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => total + entry.duration, 0);
};

// Calculate billable time from time entries
export const calculateBillableTime = (entries: TimeEntry[]): number => {
  return entries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + entry.duration, 0);
};

// Format date utility
export const formatDate = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
};

// Priority map for work orders
export const priorityMap = {
  low: { label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-300' },
};
