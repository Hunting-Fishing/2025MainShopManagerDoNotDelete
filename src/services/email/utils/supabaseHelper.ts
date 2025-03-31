/**
 * Generic response interface for service methods
 */
export interface GenericResponse<T> {
  data: T | null;
  error: any;
}

/**
 * Utility function for custom table queries
 */
export const customTableQuery = async <T>(tableName: string, query: any): Promise<GenericResponse<T>> => {
  try {
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error querying ${tableName}:`, error);
      return { data: null, error };
    }
    
    return { data: data as T, error: null };
  } catch (error) {
    console.error(`Exception querying ${tableName}:`, error);
    return { data: null, error };
  }
};

/**
 * Utility function to parse JSON fields from database responses
 */
export const parseJsonField = <T>(field: any, defaultValue: T): T => {
  try {
    if (field === null || field === undefined) return defaultValue;
    
    // If it's already an object, return it
    if (typeof field === 'object' && !Array.isArray(field)) return field as T;
    
    // Otherwise, try to parse it as JSON
    const fieldStr = typeof field === 'string' ? field : JSON.stringify(field);
    return JSON.parse(fieldStr) as T;
  } catch (e) {
    console.error("Error parsing JSON field:", e);
    return defaultValue;
  }
};
