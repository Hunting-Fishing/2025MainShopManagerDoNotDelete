import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

// Helper function to handle errors
const handleSupabaseError = (error: any, context: string) => {
  if (error) {
    console.error(`${context}:`, error);
    throw error;
  }
};

// Helper function to construct customer's full name
const getCustomerName = (customer: any) => {
  if (!customer) return undefined;
  return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
};

// Helper function to transform work order data
const transformWorkOrder = (workOrder: any, customersMap: Map<string, any>, vehiclesMap: Map<string, any>): WorkOrder => {
  const customer = workOrder.customer_id ? customersMap.get(workOrder.customer_id) : null;
  const vehicle = workOrder.vehicle_id ? vehiclesMap.get(workOrder.vehicle_id) : null;

  return {
    ...workOrder,
    // Customer information
    customer_name: getCustomerName(customer),
    customer_email: customer?.email || undefined,
    customer_phone: customer?.phone || undefined,
    customer_address: customer?.address || undefined,
    customer_city: customer?.city || undefined,
    customer_state: customer?.state || undefined,
    customer_zip: customer?.postal_code || undefined,
    
    // Vehicle information
    vehicle_year: vehicle?.year?.toString() || undefined,
    vehicle_make: vehicle?.make || undefined,
    vehicle_model: vehicle?.model || undefined,
    vehicle_vin: vehicle?.vin || undefined,
    vehicle_license_plate: vehicle?.license_plate || undefined,
    vehicle_odometer: vehicle?.odometer?.toString() || undefined,
    
    // Vehicle object for backward compatibility
    vehicle: vehicle ? {
      id: vehicle.id,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      trim: vehicle.trim
    } : undefined,

    // Legacy fields for backward compatibility
    customer: getCustomerName(customer),
    technician: 'Unassigned', // Default value since we don't have technician data yet
    date: workOrder.created_at,
    dueDate: workOrder.end_time || undefined,
    due_date: workOrder.end_time || undefined,
    location: 'Shop', // Default value
    notes: workOrder.description || '',
    total_billable_time: 0, // Default value
    timeEntries: [],
    inventoryItems: [],
    inventory_items: [],
    jobLines: []
  };
};

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getAllWorkOrders: Starting to fetch work orders...');
    
    // Fetch work orders
    const { data: workOrders, error: workOrderError } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (workOrderError) {
      console.error('getAllWorkOrders: Error fetching work orders:', workOrderError);
      throw workOrderError;
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('getAllWorkOrders: No work orders found');
      return [];
    }

    // Get unique customer and vehicle IDs
    const customerIds = [...new Set(workOrders.map(wo => wo.customer_id).filter(Boolean))];
    const vehicleIds = [...new Set(workOrders.map(wo => wo.vehicle_id).filter(Boolean))];

    // Fetch customers in parallel
    let customersMap = new Map();
    if (customerIds.length > 0) {
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds);

      if (customerError) {
        console.error('getAllWorkOrders: Error fetching customers:', customerError);
      } else if (customers) {
        customersMap = new Map(customers.map(c => [c.id, c]));
      }
    }

    // Fetch vehicles in parallel
    let vehiclesMap = new Map();
    if (vehicleIds.length > 0) {
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .in('id', vehicleIds);

      if (vehicleError) {
        console.error('getAllWorkOrders: Error fetching vehicles:', vehicleError);
      } else if (vehicles) {
        vehiclesMap = new Map(vehicles.map(v => [v.id, v]));
      }
    }

    // Transform work orders with related data
    const transformedWorkOrders = workOrders.map(workOrder => {
      const customer = workOrder.customer_id ? customersMap.get(workOrder.customer_id) : null;
      const vehicle = workOrder.vehicle_id ? vehiclesMap.get(workOrder.vehicle_id) : null;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
        customer_email: customer?.email || undefined,
        customer_phone: customer?.phone || undefined,
        customer_address: customer?.address || undefined,
        customer_city: customer?.city || undefined,
        customer_state: customer?.state || undefined,
        customer_zip: customer?.postal_code || undefined,
        
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || undefined,
        vehicle_make: vehicle?.make || undefined,
        vehicle_model: vehicle?.model || undefined,
        vehicle_vin: vehicle?.vin || undefined,
        vehicle_license_plate: vehicle?.license_plate || undefined,
        vehicle_odometer: vehicle?.odometer?.toString() || undefined,
        
        // Vehicle object for backward compatibility
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
        technician: 'Unassigned', // Default value since we don't have technician data yet
        date: workOrder.created_at,
        dueDate: workOrder.end_time || undefined,
        due_date: workOrder.end_time || undefined,
        location: 'Shop', // Default value
        notes: workOrder.description || '',
        total_billable_time: 0, // Default value
        timeEntries: [],
        inventoryItems: [],
        inventory_items: [],
        jobLines: []
      };
    });

    console.log('getAllWorkOrders: Successfully fetched and transformed work orders:', transformedWorkOrders.length);
    return transformedWorkOrders;

  } catch (error) {
    console.error('getAllWorkOrders: Unexpected error:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('getWorkOrderById: Fetching work order with ID:', id);
    
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('getWorkOrderById: Error:', error);
      throw error;
    }

    if (!workOrder) {
      console.log('getWorkOrderById: Work order not found');
      return null;
    }

    // Fetch related customer data
    let customer = null;
    if (workOrder.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', workOrder.customer_id)
        .single();

      if (customerError) {
        console.error('getWorkOrderById: Error fetching customer:', customerError);
      } else {
        customer = customerData;
      }
    }

    // Fetch related vehicle data
    let vehicle = null;
    if (workOrder.vehicle_id) {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', workOrder.vehicle_id)
        .single();

      if (vehicleError) {
        console.error('getWorkOrderById: Error fetching vehicle:', vehicleError);
      } else {
        vehicle = vehicleData;
      }
    }

    // Transform the work order
    const transformedWorkOrder: WorkOrder = {
      ...workOrder,
      // Customer information
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
      customer_email: customer?.email || undefined,
      customer_phone: customer?.phone || undefined,
      customer_address: customer?.address || undefined,
      customer_city: customer?.city || undefined,
      customer_state: customer?.state || undefined,
      customer_zip: customer?.postal_code || undefined,
      
      // Vehicle information
      vehicle_year: vehicle?.year?.toString() || undefined,
      vehicle_make: vehicle?.make || undefined,
      vehicle_model: vehicle?.model || undefined,
      vehicle_vin: vehicle?.vin || undefined,
      vehicle_license_plate: vehicle?.license_plate || undefined,
      vehicle_odometer: vehicle?.odometer?.toString() || undefined,
      
      // Vehicle object for backward compatibility
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim
      } : undefined,

      // Legacy fields for backward compatibility
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
      technician: 'Unassigned',
      date: workOrder.created_at,
      dueDate: workOrder.end_time || undefined,
      due_date: workOrder.end_time || undefined,
      location: 'Shop',
      notes: workOrder.description || '',
      total_billable_time: 0,
      timeEntries: [],
      inventoryItems: [],
      inventory_items: [],
      jobLines: []
    };

    console.log('getWorkOrderById: Successfully fetched and transformed work order');
    return transformedWorkOrder;

  } catch (error) {
    console.error('getWorkOrderById: Unexpected error:', error);
    throw error;
  }
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersByCustomerId: Fetching work orders for customer:', customerId);
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrdersByCustomerId: Error:', error);
      throw error;
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('getWorkOrdersByCustomerId: No work orders found for customer');
      return [];
    }

    // Fetch customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError) {
      console.error('getWorkOrdersByCustomerId: Error fetching customer:', customerError);
    }

    // Get unique vehicle IDs
    const vehicleIds = [...new Set(workOrders.map(wo => wo.vehicle_id).filter(Boolean))];
    
    // Fetch vehicles
    let vehiclesMap = new Map();
    if (vehicleIds.length > 0) {
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .in('id', vehicleIds);

      if (vehicleError) {
        console.error('getWorkOrdersByCustomerId: Error fetching vehicles:', vehicleError);
      } else if (vehicles) {
        vehiclesMap = new Map(vehicles.map(v => [v.id, v]));
      }
    }

    // Transform work orders
    const transformedWorkOrders = workOrders.map(workOrder => {
      const vehicle = workOrder.vehicle_id ? vehiclesMap.get(workOrder.vehicle_id) : null;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
        customer_email: customer?.email || undefined,
        customer_phone: customer?.phone || undefined,
        customer_address: customer?.address || undefined,
        customer_city: customer?.city || undefined,
        customer_state: customer?.state || undefined,
        customer_zip: customer?.postal_code || undefined,
        
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || undefined,
        vehicle_make: vehicle?.make || undefined,
        vehicle_model: vehicle?.model || undefined,
        vehicle_vin: vehicle?.vin || undefined,
        vehicle_license_plate: vehicle?.license_plate || undefined,
        vehicle_odometer: vehicle?.odometer?.toString() || undefined,
        
        // Vehicle object for backward compatibility
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
        technician: 'Unassigned',
        date: workOrder.created_at,
        dueDate: workOrder.end_time || undefined,
        due_date: workOrder.end_time || undefined,
        location: 'Shop',
        notes: workOrder.description || '',
        total_billable_time: 0,
        timeEntries: [],
        inventoryItems: [],
        inventory_items: [],
        jobLines: []
      };
    });

    console.log('getWorkOrdersByCustomerId: Successfully fetched work orders:', transformedWorkOrders.length);
    return transformedWorkOrders;

  } catch (error) {
    console.error('getWorkOrdersByCustomerId: Unexpected error:', error);
    throw error;
  }
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersByStatus: Fetching work orders with status:', status);
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrdersByStatus: Error:', error);
      throw error;
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('getWorkOrdersByStatus: No work orders found with status');
      return [];
    }

    // Get unique customer and vehicle IDs
    const customerIds = [...new Set(workOrders.map(wo => wo.customer_id).filter(Boolean))];
    const vehicleIds = [...new Set(workOrders.map(wo => wo.vehicle_id).filter(Boolean))];

    // Fetch customers and vehicles in parallel
    const [customersResponse, vehiclesResponse] = await Promise.all([
      customerIds.length > 0 ? supabase.from('customers').select('*').in('id', customerIds) : { data: [], error: null },
      vehicleIds.length > 0 ? supabase.from('vehicles').select('*').in('id', vehicleIds) : { data: [], error: null }
    ]);

    // Create lookup maps
    const customersMap = new Map((customersResponse.data || []).map(c => [c.id, c]));
    const vehiclesMap = new Map((vehiclesResponse.data || []).map(v => [v.id, v]));

    // Transform work orders
    const transformedWorkOrders = workOrders.map(workOrder => {
      const customer = workOrder.customer_id ? customersMap.get(workOrder.customer_id) : null;
      const vehicle = workOrder.vehicle_id ? vehiclesMap.get(workOrder.vehicle_id) : null;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
        customer_email: customer?.email || undefined,
        customer_phone: customer?.phone || undefined,
        
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || undefined,
        vehicle_make: vehicle?.make || undefined,
        vehicle_model: vehicle?.model || undefined,
        vehicle_vin: vehicle?.vin || undefined,
        vehicle_license_plate: vehicle?.license_plate || undefined,
        
        // Vehicle object for backward compatibility
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
        technician: 'Unassigned',
        date: workOrder.created_at,
        dueDate: workOrder.end_time || undefined,
        due_date: workOrder.end_time || undefined,
        location: 'Shop',
        notes: workOrder.description || '',
        total_billable_time: 0,
        timeEntries: [],
        inventoryItems: [],
        inventory_items: [],
        jobLines: []
      };
    });

    console.log('getWorkOrdersByStatus: Successfully fetched work orders:', transformedWorkOrders.length);
    return transformedWorkOrders;

  } catch (error) {
    console.error('getWorkOrdersByStatus: Unexpected error:', error);
    throw error;
  }
};

export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('getUniqueTechnicians: Error:', error);
      throw error;
    }

    // For now, return a default set since we don't have technician names
    // This should be replaced with actual technician data from profiles table
    const uniqueTechnicians = [...new Set(data?.map(item => item.technician_id).filter(Boolean))];
    return uniqueTechnicians.map(id => `Technician ${id}`);

  } catch (error) {
    console.error('getUniqueTechnicians: Unexpected error:', error);
    return [];
  }
};

export const getWorkOrderTimeEntries = async (workOrderId: string) => {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrderTimeEntries: Error:', error);
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('getWorkOrderTimeEntries: Unexpected error:', error);
    return [];
  }
};
