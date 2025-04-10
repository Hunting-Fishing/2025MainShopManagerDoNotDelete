
// This utility provides type-safe access to Supabase schema types in TypeScript
// It helps prevent errors when querying tables that don't exist in the schema

import { supabase } from '@/lib/supabase';

// Define common mock tables that aren't yet in the real schema
const mockTables = [
  'business_types',
  'business_industries',
  'payment_methods',
  'relationship_types',
  'vin_prefixes',
  'invoice_templates',
  'invoice_template_items',
  'work_order_templates',
  'work_order_template_items'
];

/**
 * Helper function to safely query tables that might not exist in the schema yet
 * This is a temporary solution until we create the real tables in the schema
 */
export function safeQueryTable(tableName: string) {
  if (mockTables.includes(tableName)) {
    // For mock tables, return a mock response
    return {
      select: () => {
        return {
          eq: () => Promise.resolve({ data: [], error: null }),
          neq: () => Promise.resolve({ data: [], error: null }),
          gt: () => Promise.resolve({ data: [], error: null }),
          lt: () => Promise.resolve({ data: [], error: null }),
          gte: () => Promise.resolve({ data: [], error: null }),
          lte: () => Promise.resolve({ data: [], error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
        };
      },
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    };
  } else {
    // For real tables, use the actual Supabase client
    return supabase.from(tableName);
  }
}

/**
 * Helper function to safely query RPC functions that might not exist yet
 */
export function safeCallRPC(functionName: string, params?: any) {
  // For now, just mocking the response
  return Promise.resolve({ data: 0, error: null });
}

/**
 * Checks if a table exists in the schema
 */
export async function tableExists(tableName: string) {
  if (mockTables.includes(tableName)) {
    return true;
  }
  
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_name', tableName)
    .eq('table_schema', 'public');
    
  return !error && data && data.length > 0;
}
