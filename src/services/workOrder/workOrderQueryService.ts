
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { normalizeWorkOrder } from '@/utils/workOrders/formatters';

/**
 * Get all work orders with customer and vehicle information
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getAllWorkOrders: Starting to fetch work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllWorkOrders: Supabase error:', error);
      throw error;
    }

    console.log('getAllWorkOrders: Raw data from Supabase:', data);

    if (!data || data.length === 0) {
      console.log('getAllWorkOrders: No work orders found');
      return [];
    }

    // Transform the data to match WorkOrder interface
    const workOrders = data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      
      return {
        ...wo,
        // Customer info
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        
        // Vehicle info
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Backward compatibility
        date: wo.created_at,
        dueDate: wo.end_time,
        due_date: wo.end_time,
        priority: 'medium', // Default priority
        location: '', // Default location
        notes: wo.description || '',
        
        // Vehicle object for new components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate
        } : undefined
      };
    });

    console.log('getAllWorkOrders: Transformed work orders:', workOrders);
    return workOrders;
    
  } catch (error) {
    console.error('getAllWorkOrders: Error fetching work orders:', error);
    throw new Error(`Failed to fetch work orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work order by ID with full details
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('getWorkOrderById: Fetching work order with ID:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('getWorkOrderById: Supabase error:', error);
      throw error;
    }

    if (!data) {
      console.log('getWorkOrderById: No work order found with ID:', id);
      return null;
    }

    const customer = data.customers;
    const vehicle = data.vehicles;
    
    const workOrder = {
      ...data,
      // Customer info
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      
      // Vehicle info
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      
      // Backward compatibility
      date: data.created_at,
      dueDate: data.end_time,
      due_date: data.end_time,
      priority: 'medium',
      location: '',
      notes: data.description || '',
      
      // Vehicle object
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate
      } : undefined
    };

    console.log('getWorkOrderById: Transformed work order:', workOrder);
    return workOrder;
    
  } catch (error) {
    console.error('getWorkOrderById: Error fetching work order:', error);
    throw new Error(`Failed to fetch work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersByCustomerId: Fetching work orders for customer:', customerId);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles:vehicle_id (
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
      console.error('getWorkOrdersByCustomerId: Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('getWorkOrdersByCustomerId: No work orders found for customer:', customerId);
      return [];
    }

    const workOrders = data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      
      return {
        ...wo,
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        date: wo.created_at,
        dueDate: wo.end_time,
        priority: 'medium',
        location: '',
        notes: wo.description || '',
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate
        } : undefined
      };
    });

    console.log('getWorkOrdersByCustomerId: Found work orders:', workOrders.length);
    return workOrders;
    
  } catch (error) {
    console.error('getWorkOrdersByCustomerId: Error:', error);
    throw new Error(`Failed to fetch work orders for customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work orders by status
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles:vehicle_id (
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

    if (error) throw error;

    if (!data) return [];

    return data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      
      return {
        ...wo,
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        date: wo.created_at,
        dueDate: wo.end_time,
        priority: 'medium',
        location: '',
        notes: wo.description || '',
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate
        } : undefined
      };
    });
  } catch (error) {
    console.error('getWorkOrdersByStatus: Error:', error);
    throw new Error(`Failed to fetch work orders by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    if (error) throw error;

    const uniqueTechnicians = [...new Set(data?.map(wo => wo.technician_id).filter(Boolean) || [])];
    return uniqueTechnicians;
  } catch (error) {
    console.error('getUniqueTechnicians: Error:', error);
    throw new Error(`Failed to fetch technicians: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work order time entries
 */
export const getWorkOrderTimeEntries = async (workOrderId: string) => {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getWorkOrderTimeEntries: Error:', error);
    throw new Error(`Failed to fetch time entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
