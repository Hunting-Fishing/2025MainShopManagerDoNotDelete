
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";

/**
 * Get all work orders with explicit JOINs for better reliability
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders with explicit joins...');
    
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
      console.error('Error fetching work orders:', error);
      throw error;
    }

    console.log('Raw work orders data:', data);

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map(wo => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;

      return {
        ...wo,
        // Customer fields for backward compatibility
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
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
        
        // Include vehicle object for newer components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Legacy fields for UI components
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        technician: wo.technician_id || '',
        timeEntries: [],
        inventoryItems: [],
        jobLines: []
      };
    });

    console.log('Transformed work orders:', workOrders);
    return workOrders;

  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    return [];
  }
};

/**
 * Get work order by ID with explicit JOINs
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);
    
    if (!id || id === 'undefined') {
      console.error('Invalid work order ID provided:', id);
      return null;
    }

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
      .maybeSingle();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('No work order found with ID:', id);
      return null;
    }

    console.log('Raw work order data:', data);

    const customer = data.customers;
    const vehicle = data.vehicles;

    const workOrder: WorkOrder = {
      ...data,
      // Customer fields for backward compatibility
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
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
      
      // Include vehicle object for newer components
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim
      } : undefined,

      // Legacy fields for UI components
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      technician: data.technician_id || '',
      timeEntries: [],
      inventoryItems: [],
      jobLines: []
    };

    console.log('Transformed work order:', workOrder);
    return workOrder;

  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    return null;
  }
};

/**
 * Get work orders by customer ID with explicit JOINs
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders for customer:', customerId);
    
    if (!customerId || customerId === 'undefined') {
      console.error('Invalid customer ID provided:', customerId);
      return [];
    }

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
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }

    console.log('Raw work orders data for customer:', data);

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map(wo => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;

      return {
        ...wo,
        // Customer fields for backward compatibility
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
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
        
        // Include vehicle object for newer components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Legacy fields for UI components
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        technician: wo.technician_id || '',
        timeEntries: [],
        inventoryItems: [],
        jobLines: []
      };
    });

    console.log('Transformed work orders for customer:', workOrders);
    return workOrders;

  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    return [];
  }
};

/**
 * Get work orders by status with explicit JOINs
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
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
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map(wo => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;

      return {
        ...wo,
        // Customer fields for backward compatibility
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
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
        
        // Include vehicle object for newer components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Legacy fields for UI components
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        technician: wo.technician_id || '',
        timeEntries: [],
        inventoryItems: [],
        jobLines: []
      };
    });

    return workOrders;

  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    return [];
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    const uniqueTechnicians = [...new Set((data || []).map(wo => wo.technician_id).filter(Boolean))];
    return uniqueTechnicians;

  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};
