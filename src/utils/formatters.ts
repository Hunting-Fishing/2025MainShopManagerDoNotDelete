
/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Format a date to a readable string (MM/DD/YYYY)
 */
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format a date with time (MM/DD/YYYY, HH:MM AM/PM)
 */
export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Clean a phone number by removing all non-numeric characters
 */
export const cleanPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

/**
 * Format a phone number to (XXX) XXX-XXXX format
 */
export const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Strip all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the cleaned phone number has 10 digits
  if (cleaned.length !== 10) {
    return phone; // Return original if not valid
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
};

/**
 * Format a number with commas (e.g., 1,234.56)
 */
export const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0';
  }
  
  return numValue.toLocaleString('en-US');
};
