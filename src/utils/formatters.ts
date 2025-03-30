
/**
 * Format a phone number string into a standardized format
 * Example: (123) 456-7890
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Clean input by removing all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the input is valid
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  // If the phone number doesn't match the expected format, return it as is
  return phoneNumber;
};

/**
 * Format a date string into a localized date string
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return dateString;
  }
};
