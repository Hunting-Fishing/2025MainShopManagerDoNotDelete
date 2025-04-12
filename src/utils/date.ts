
/**
 * Format date for display
 * @param dateStr Date string to format
 * @param format Optional format specification
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format time for display
 * @param timeStr Time string to format
 * @returns Formatted time string
 */
export const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return "N/A";
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid time";
  }
};

/**
 * Check if a date is today
 * @param date Date to check
 * @returns Boolean indicating if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};
