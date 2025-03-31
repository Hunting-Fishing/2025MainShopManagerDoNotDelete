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
