
import { supabase } from '@/lib/supabase';

// Type for handling responses to avoid TypeScript circular reference issues
export type GenericResponse<T = any> = { data: T | null, error: any };

/**
 * Helper for accessing custom tables that aren't in the generated types
 * This avoids TypeScript errors when accessing tables not in the database schema
 */
export const customTableQuery = (tableName: string) => {
  return (supabase as any).from(tableName);
};
