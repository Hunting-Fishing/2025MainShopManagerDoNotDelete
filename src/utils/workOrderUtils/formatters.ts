
import { format } from 'date-fns';

/**
 * Format a date string into a standardized format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a time string into a standardized format
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Format a duration in minutes to hours and minutes format
 */
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

// Add color styling for different priority levels
export const priorityColorMap = {
  "low": "bg-green-100 text-green-800 border border-green-300",
  "medium": "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "high": "bg-red-100 text-red-800 border border-red-300"
};
