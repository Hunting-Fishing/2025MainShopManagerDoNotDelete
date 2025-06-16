
import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

export function formatTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      return 'Invalid Time';
    }
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
}

export function formatDateTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      return 'Invalid Date/Time';
    }
    return format(date, 'MMM dd, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return 'Invalid Date/Time';
  }
}

export function formatTimeInHoursAndMinutes(minutes: number): string {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return '0h 0m';
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
}
