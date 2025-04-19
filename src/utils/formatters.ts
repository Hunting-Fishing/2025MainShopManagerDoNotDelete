
/**
 * Formats a phone number to US format (XXX) XXX-XXXX
 * 
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber?: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid US number
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  } else if (cleaned.length > 0) {
    // Return whatever digits we have if it doesn't match the pattern
    return cleaned;
  }
  
  return '';
};

/**
 * Formats a currency amount
 * 
 * @param amount Number to format as currency
 * @param locale Locale to use for formatting (default: 'en-US')
 * @param currency Currency code to use (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount?: number | string | null,
  locale = 'en-US',
  currency = 'USD'
): string => {
  if (amount === undefined || amount === null) return '';
  
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format as currency
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Formats a percentage value
 * 
 * @param value Number to format as percentage
 * @param decimalPlaces Number of decimal places to show (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value?: number | null, 
  decimalPlaces = 1
): string => {
  if (value === undefined || value === null) return '';
  
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * Truncates text to a specific length and adds ellipsis if needed
 * 
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation (default: 50)
 * @returns Truncated text string with ellipsis if needed
 */
export const truncateText = (
  text?: string | null,
  maxLength = 50
): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};
