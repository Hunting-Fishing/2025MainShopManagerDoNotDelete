
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";

// Cache for deduplicating requests
const requestCache = new Map<string, Promise<any>>();
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Create a cache key for requests
 */
const createCacheKey = (operation: string, params: any): string => {
  return `${operation}_${JSON.stringify(params)}`;
};

/**
 * Get cached request or create new one
 */
const getCachedRequest = <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  if (requestCache.has(key)) {
    console.log(`Using cached request for: ${key}`);
    return requestCache.get(key)!;
  }

  const request = requestFn();
  requestCache.set(key, request);
  
  // Clear cache after duration
  setTimeout(() => {
    requestCache.delete(key);
  }, CACHE_DURATION);

  return request;
};

/**
 * Get all work orders with relationships
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  const cacheKey = createCacheKey('getAllWorkOrders', {});
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching all work orders...');
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles (
            id,
            year,
            make,
            model,
            vin,
            license_plate,
            trim
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all work orders:', error);
        throw error;
      }

      console.log('All work orders fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getAllWorkOrders:', error);
      throw error;
    }
  });
};

/**
 * Get work orders by customer ID with optimized relationships
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  if (!customerId || customerId === "undefined") {
    console.warn('Invalid customer ID provided to getWorkOrdersByCustomerId');
    return [];
  }

  const cacheKey = createCacheKey('getWorkOrdersByCustomerId', { customerId });
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching work orders for customer:', customerId);
      
      // Try the optimized query first with explicit foreign key names
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers!work_orders_customer_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles!work_orders_vehicle_id_fkey (
            id,
            year,
            make,
            model,
            vin,
            license_plate,
            trim
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work orders by customer:', error);
        
        // Fallback: Try without explicit foreign key names
        console.log('Trying fallback query without explicit foreign key names...');
        const fallbackResult = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (
              id,
              first_name,
              last_name,
              email,
              phone,
              address,
              city,
              state,
              postal_code
            ),
            vehicles (
              id,
              year,
              make,
              model,
              vin,
              license_plate,
              trim
            )
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (fallbackResult.error) {
          console.error('Fallback query also failed:', fallbackResult.error);
          throw fallbackResult.error;
        }

        console.log('Fallback query successful, work orders fetched:', fallbackResult.data?.length || 0);
        return fallbackResult.data || [];
      }

      console.log('Work orders fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getWorkOrdersByCustomerId:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  });
};

/**
 * Get work order by ID with relationships
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  if (!id) {
    console.warn('No work order ID provided');
    return null;
  }

  const cacheKey = createCacheKey('getWorkOrderById', { id });
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching work order by ID:', id);
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles (
            id,
            year,
            make,
            model,
            vin,
            license_plate,
            trim
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching work order by ID:', error);
        throw error;
      }

      console.log('Work order fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in getWorkOrderById:', error);
      return null;
    }
  });
};

/**
 * Get work orders by status
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  const cacheKey = createCacheKey('getWorkOrdersByStatus', { status });
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching work orders by status:', status);
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          vehicles (
            id,
            year,
            make,
            model,
            vin,
            license_plate
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work orders by status:', error);
        throw error;
      }

      console.log('Work orders by status fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getWorkOrdersByStatus:', error);
      return [];
    }
  });
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<string[]> => {
  const cacheKey = createCacheKey('getUniqueTechnicians', {});
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching unique technicians...');
      
      const { data, error } = await supabase
        .from('work_orders')
        .select('technician_id')
        .not('technician_id', 'is', null);

      if (error) {
        console.error('Error fetching unique technicians:', error);
        throw error;
      }

      const uniqueTechnicians = [...new Set(data?.map(order => order.technician_id).filter(Boolean) || [])];
      console.log('Unique technicians fetched:', uniqueTechnicians.length);
      return uniqueTechnicians;
    } catch (error) {
      console.error('Error in getUniqueTechnicians:', error);
      return [];
    }
  });
};

/**
 * Clear request cache - useful for forcing fresh data
 */
export const clearWorkOrderCache = (): void => {
  requestCache.clear();
  console.log('Work order request cache cleared');
};
