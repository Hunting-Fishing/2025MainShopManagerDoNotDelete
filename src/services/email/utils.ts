
/**
 * Parse a JSON string or return a default value if parsing fails
 * @param jsonData The JSON string to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed JSON data or the default value
 */
export function parseJsonField<T>(jsonData: any, defaultValue: T): T {
  if (!jsonData) return defaultValue;
  
  if (typeof jsonData === 'object') return jsonData as T;
  
  try {
    return JSON.parse(jsonData) as T;
  } catch (e) {
    console.error('Failed to parse JSON data:', e);
    return defaultValue;
  }
}
