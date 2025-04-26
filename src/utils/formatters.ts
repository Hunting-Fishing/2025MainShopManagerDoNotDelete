
/**
 * Format date string to readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (MM/DD/YYYY)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

/**
 * Format currency
 * @param amount - Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format percentage
 * @param value - Number to format (0-1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return (value * 100).toFixed(2) + '%';
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
};

/**
 * Format phone number to standard format
 * @param phone - Phone number string
 * @returns Formatted phone number (XXX-XXX-XXXX)
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the input is of correct length
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length > 10) {
    // Handle country code
    return `+${cleaned.slice(0, cleaned.length - 10)}-${cleaned.slice(-10, -7)}-${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  // If the input is not a valid phone number, return it as is
  return phone;
};
