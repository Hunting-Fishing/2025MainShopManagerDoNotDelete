
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
