
/**
 * Parses a JSON field from a database record
 * @param field The field to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns The parsed value or the default value
 */
export const parseJsonField = <T>(field: any, defaultValue: T): T => {
  if (!field) return defaultValue;
  
  try {
    // If it's already an object, return it
    if (typeof field === 'object') return field as T;
    
    // Otherwise parse the JSON string
    return JSON.parse(field) as T;
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return defaultValue;
  }
};

/**
 * Safely converts an object to a JSON string
 * @param obj The object to stringify
 * @returns JSON string or undefined if stringification fails
 */
export const safeStringify = (obj: any): string | undefined => {
  if (!obj) return undefined;
  
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error stringifying object:', error);
    return undefined;
  }
};

/**
 * Validates an email address
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};
