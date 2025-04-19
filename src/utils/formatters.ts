
/**
 * Format a number as currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * Format a phone number to standard US format (XXX) XXX-XXXX
 */
export const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Clean the input first
  const cleaned = cleanPhoneNumber(phone);
  
  // Format the phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length > 10) {
    // For international numbers or longer formats
    return `+${cleaned}`;
  }
  
  // If the number doesn't match expected formats, return as is
  return phone;
};

/**
 * Clean a phone number to only contain digits
 */
export const cleanPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

/**
 * Format date as MM/DD/YYYY
 */
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format time as HH:MM AM/PM
 */
export const formatTime = (time: string | Date | undefined): string => {
  if (!time) return '';
  
  const dateObj = typeof time === 'string' ? new Date(time) : time;
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};
