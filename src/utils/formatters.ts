
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Format a phone number as (XXX) XXX-XXXX
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Return empty string if no digits
  if (!digits.length) return '';
  
  // Format based on the number of digits
  if (digits.length <= 3) {
    return `(${digits}`;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

/**
 * Clean phone number to only contain digits
 */
export const cleanPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/\D/g, '');
};
