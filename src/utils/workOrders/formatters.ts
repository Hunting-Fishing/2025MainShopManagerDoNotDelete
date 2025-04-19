
import { format } from 'date-fns';

// Format a date string into a human-readable format
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString || 'N/A';
  }
};

// Format time in minutes to hours and minutes
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  if (minutes === 0) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  
  return `${hours}h ${mins}m`;
};
