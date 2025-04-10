
/**
 * Format a number as currency
 * @param value Amount to format as currency
 * @param currency Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | string | null | undefined, currency = 'USD'): string => {
  if (value === null || value === undefined) return '';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) return '';
  
  // Format the number as currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Format a date using Intl.DateTimeFormat
 * @param date Date to format
 * @param format Format options
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number | null | undefined, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? '2-digit' : format === 'medium' ? 'short' : 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Format a time duration (in minutes) to hours and minutes
 * @param minutes Number of minutes
 * @returns Formatted time string (e.g. "2h 30m")
 */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  
  return `${hours}h ${mins}m`;
};

/**
 * Format a percentage
 * @param value Value to format as percentage
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercent = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined) return '';
  
  return `${value.toFixed(decimals)}%`;
};
