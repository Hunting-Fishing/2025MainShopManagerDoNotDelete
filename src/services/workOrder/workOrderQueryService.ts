
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";

/**
 * Get all work orders with complete relationship data
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders with relationships...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(
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
        vehicles!work_orders_vehicle_id_fkey(
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
      console.error('Error fetching work orders:', error);
      throw error;
    }

    console.log('Raw work orders data:', data);

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map((order: any) => {
      // Handle customer data
      const customer = order.customers;
      const customerName = customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        : 'Unknown Customer';
      
      // Handle vehicle data - vehicles is an array, get first element
      const vehicle = order.vehicles?.[0];
      
      return {
        ...order,
        // Customer fields for backward compatibility
        customer: customerName,
        customer_name: customerName,
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        
        // Vehicle fields for backward compatibility
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Structured customer and vehicle objects
        customers: customer,
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined
      };
    });

    console.log('Transformed work orders:', workOrders);
    return workOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get a single work order by ID with complete relationship data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(
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
        vehicles!work_orders_vehicle_id_fkey(
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
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('Work order not found:', id);
      return null;
    }

    console.log('Raw work order data:', data);

    // Handle customer data
    const customer = data.customers;
    const customerName = customer 
      ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
      : 'Unknown Customer';
    
    // Handle vehicle data - vehicles is an array, get first element
    const vehicle = data.vehicles?.[0];

    const workOrder: WorkOrder = {
      ...data,
      // Customer fields for backward compatibility
      customer: customerName,
      customer_name: customerName,
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      customer_zip: customer?.postal_code || '',
      
      // Vehicle fields for backward compatibility
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      
      // Structured customer and vehicle objects
      customers: customer,
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim
      } : undefined
    };

    console.log('Transformed work order:', workOrder);
    return workOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

/**
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders for customer:', customerId);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(
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
        vehicles!work_orders_vehicle_id_fkey(
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
      throw error;
    }

    console.log('Raw work orders data for customer:', data);

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map((order: any) => {
      // Handle customer data
      const customer = order.customers;
      const customerName = customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        : 'Unknown Customer';
      
      // Handle vehicle data - vehicles is an array, get first element
      const vehicle = order.vehicles?.[0];
      
      return {
        ...order,
        // Customer fields for backward compatibility
        customer: customerName,
        customer_name: customerName,
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        
        // Vehicle fields for backward compatibility
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Structured customer and vehicle objects
        customers: customer,
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined
      };
    });

    console.log('Transformed work orders for customer:', workOrders);
    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
};

/**
 * Get work orders by status
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders by status:', status);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(
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
        vehicles!work_orders_vehicle_id_fkey(
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    console.log('Raw work orders data for status:', data);

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map((order: any) => {
      // Handle customer data
      const customer = order.customers;
      const customerName = customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        : 'Unknown Customer';
      
      // Handle vehicle data - vehicles is an array, get first element
      const vehicle = order.vehicles?.[0];
      
      return {
        ...order,
        // Customer fields for backward compatibility
        customer: customerName,
        customer_name: customerName,
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        
        // Vehicle fields for backward compatibility
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Structured customer and vehicle objects
        customers: customer,
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined
      };
    });

    console.log('Transformed work orders for status:', workOrders);
    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<string[]> => {
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

    const uniqueTechnicians = [...new Set((data || []).map(order => order.technician_id))];
    console.log('Unique technicians:', uniqueTechnicians);
    
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw error;
  }
};
