
/**
 * Utility functions for formatting data
 */

/**
 * Format a phone number to a standardized format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }
  
  // Return original if it doesn't match expected patterns
  return phoneNumber;
};

/**
 * Clean a phone number by removing all non-numeric characters
 */
export const cleanPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/\D/g, '');
};

/**
 * Format a currency value
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format a percentage value
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

/**
 * Truncate a string to a specified length
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

/**
 * Format a number with commas for thousands
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};
