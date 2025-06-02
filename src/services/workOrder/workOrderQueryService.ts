
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

// Request cache to avoid duplicate API calls
const requestCache = new Map<string, Promise<any>>();

// Cache cleanup interval (5 minutes)
setInterval(() => {
  requestCache.clear();
}, 5 * 60 * 1000);

const getCachedRequest = async <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  if (requestCache.has(key)) {
    console.log(`Using cached request for: ${key}`);
    return requestCache.get(key);
  }
  
  const promise = requestFn();
  requestCache.set(key, promise);
  
  // Remove from cache after completion (success or failure)
  promise.finally(() => {
    setTimeout(() => requestCache.delete(key), 1000);
  });
  
  return promise;
};

/**
 * Get all work orders with related data
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  const cacheKey = 'getAllWorkOrders';
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching all work orders...');
      
      // Use explicit foreign key names to avoid relationship conflicts
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customer:customer_id (
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
          vehicle:vehicle_id (
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

      console.log('Raw work orders data:', data);

      if (!data || data.length === 0) {
        console.log('No work orders found');
        return [];
      }

      // Transform the data to match our WorkOrder interface
      const workOrders = data.map((workOrder) => {
        try {
          const normalized = normalizeWorkOrder(workOrder);
          
          // Add customer and vehicle information
          if (workOrder.customer) {
            const customer = workOrder.customer as any;
            normalized.customer = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
            normalized.customer_name = normalized.customer;
            normalized.customer_email = customer.email;
            normalized.customer_phone = customer.phone;
            normalized.customer_address = customer.address;
            normalized.customer_city = customer.city;
            normalized.customer_state = customer.state;
            normalized.customer_zip = customer.postal_code;
          }
          
          if (workOrder.vehicle) {
            const vehicle = workOrder.vehicle as any;
            normalized.vehicle = vehicle;
            normalized.vehicle_year = vehicle.year?.toString();
            normalized.vehicle_make = vehicle.make;
            normalized.vehicle_model = vehicle.model;
            normalized.vehicle_vin = vehicle.vin;
            normalized.vehicle_license_plate = vehicle.license_plate;
          }
          
          return normalized;
        } catch (error) {
          console.error('Error normalizing work order:', workOrder.id, error);
          return null;
        }
      }).filter(Boolean) as WorkOrder[];

      console.log('Processed work orders:', workOrders.length);
      return workOrders;
      
    } catch (error) {
      console.error('Error in getAllWorkOrders:', error);
      throw error;
    }
  });
};

/**
 * Get work order by ID with related data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  const cacheKey = `getWorkOrderById_${JSON.stringify({ id })}`;
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching work order by ID:', id);
      
      if (!id || id === 'undefined') {
        console.error('Invalid work order ID provided:', id);
        return null;
      }

      // Use explicit foreign key names to avoid relationship conflicts
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customer:customer_id (
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
          vehicle:vehicle_id (
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
        .maybeSingle();

      if (error) {
        console.error('Error fetching work order by ID:', error);
        throw error;
      }

      if (!data) {
        console.log('Work order not found:', id);
        return null;
      }

      console.log('Raw work order data:', data);

      try {
        const normalized = normalizeWorkOrder(data);
        
        // Add customer information
        if (data.customer) {
          const customer = data.customer as any;
          normalized.customer = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
          normalized.customer_name = normalized.customer;
          normalized.customer_email = customer.email;
          normalized.customer_phone = customer.phone;
          normalized.customer_address = customer.address;
          normalized.customer_city = customer.city;
          normalized.customer_state = customer.state;
          normalized.customer_zip = customer.postal_code;
        }
        
        // Add vehicle information
        if (data.vehicle) {
          const vehicle = data.vehicle as any;
          normalized.vehicle = vehicle;
          normalized.vehicle_year = vehicle.year?.toString();
          normalized.vehicle_make = vehicle.make;
          normalized.vehicle_model = vehicle.model;
          normalized.vehicle_vin = vehicle.vin;
          normalized.vehicle_license_plate = vehicle.license_plate;
        }
        
        console.log('Normalized work order:', normalized);
        return normalized;
        
      } catch (error) {
        console.error('Error normalizing work order:', error);
        return null;
      }

    } catch (error) {
      console.error('Error in getWorkOrderById:', error);
      return null;
    }
  });
};

/**
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  const cacheKey = `getWorkOrdersByCustomerId_${JSON.stringify({ customerId })}`;
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching work orders for customer:', customerId);
      
      if (!customerId || customerId === 'undefined') {
        console.error('Invalid customer ID provided:', customerId);
        return [];
      }

      // Use explicit foreign key names to avoid relationship conflicts
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customer:customer_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          vehicle:vehicle_id (
            id,
            year,
            make,
            model,
            vin,
            license_plate
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work orders by customer ID:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No work orders found for customer:', customerId);
        return [];
      }

      // Transform the data
      const workOrders = data.map((workOrder) => {
        try {
          const normalized = normalizeWorkOrder(workOrder);
          
          // Add customer information
          if (workOrder.customer) {
            const customer = workOrder.customer as any;
            normalized.customer = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
            normalized.customer_name = normalized.customer;
            normalized.customer_email = customer.email;
            normalized.customer_phone = customer.phone;
          }
          
          // Add vehicle information
          if (workOrder.vehicle) {
            const vehicle = workOrder.vehicle as any;
            normalized.vehicle = vehicle;
            normalized.vehicle_year = vehicle.year?.toString();
            normalized.vehicle_make = vehicle.make;
            normalized.vehicle_model = vehicle.model;
            normalized.vehicle_vin = vehicle.vin;
            normalized.vehicle_license_plate = vehicle.license_plate;
          }
          
          return normalized;
        } catch (error) {
          console.error('Error normalizing work order:', workOrder.id, error);
          return null;
        }
      }).filter(Boolean) as WorkOrder[];

      console.log('Processed work orders for customer:', workOrders.length);
      return workOrders;
      
    } catch (error) {
      console.error('Error in getWorkOrdersByCustomerId:', error);
      return [];
    }
  });
};

/**
 * Get work orders by status
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  const cacheKey = `getWorkOrdersByStatus_${JSON.stringify({ status })}`;
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching work orders by status:', status);
      
      // Use explicit foreign key names to avoid relationship conflicts
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customer:customer_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          vehicle:vehicle_id (
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

      if (!data || data.length === 0) {
        console.log('No work orders found for status:', status);
        return [];
      }

      // Transform the data
      const workOrders = data.map((workOrder) => {
        try {
          const normalized = normalizeWorkOrder(workOrder);
          
          // Add customer information
          if (workOrder.customer) {
            const customer = workOrder.customer as any;
            normalized.customer = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
            normalized.customer_name = normalized.customer;
          }
          
          // Add vehicle information
          if (workOrder.vehicle) {
            const vehicle = workOrder.vehicle as any;
            normalized.vehicle = vehicle;
            normalized.vehicle_year = vehicle.year?.toString();
            normalized.vehicle_make = vehicle.make;
            normalized.vehicle_model = vehicle.model;
          }
          
          return normalized;
        } catch (error) {
          console.error('Error normalizing work order:', workOrder.id, error);
          return null;
        }
      }).filter(Boolean) as WorkOrder[];

      console.log('Processed work orders by status:', workOrders.length);
      return workOrders;
      
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
  const cacheKey = 'getUniqueTechnicians';
  
  return getCachedRequest(cacheKey, async () => {
    try {
      console.log('Fetching unique technicians...');
      
      const { data, error } = await supabase
        .from('work_orders')
        .select('technician_id')
        .not('technician_id', 'is', null);

      if (error) {
        console.error('Error fetching technicians:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      const uniqueTechnicians = [...new Set(data.map(item => item.technician_id).filter(Boolean))];
      console.log('Unique technicians found:', uniqueTechnicians.length);
      
      return uniqueTechnicians;
      
    } catch (error) {
      console.error('Error in getUniqueTechnicians:', error);
      return [];
    }
  });
};
