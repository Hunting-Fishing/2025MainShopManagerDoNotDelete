
/**
 * Safely parses a JSON field from the database
 * @param jsonField The JSON field to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed value or the default value
 */
export function parseJsonField<T>(jsonField: any, defaultValue: T): T {
  if (!jsonField) return defaultValue;
  
  try {
    // If it's already an object/array, return it
    if (typeof jsonField === 'object') return jsonField as T;
    
    // If it's a string, try to parse it
    if (typeof jsonField === 'string') {
      return JSON.parse(jsonField) as T;
    }
    
    return defaultValue;
  } catch (e) {
    console.error('Error parsing JSON field:', e);
    return defaultValue;
  }
}
