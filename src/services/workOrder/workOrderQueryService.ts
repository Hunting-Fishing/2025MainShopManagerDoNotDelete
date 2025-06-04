
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

/**
 * Get all work orders with related data using SQL joins
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getAllWorkOrders: Starting to fetch work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email, phone),
        vehicle:vehicles(id, year, make, model, vin, license_plate),
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        advisor:profiles!work_orders_advisor_id_fkey(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllWorkOrders: Supabase error:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    console.log('getAllWorkOrders: Raw data from Supabase:', data);

    if (!data) {
      console.log('getAllWorkOrders: No data returned');
      return [];
    }

    // Transform the data to match our WorkOrder type
    const workOrders = data.map((item: any) => {
      try {
        // Create the base work order from the normalized data
        const workOrder = normalizeWorkOrder(item);
        
        // Add related data if available
        if (item.customer) {
          workOrder.customer = `${item.customer.first_name || ''} ${item.customer.last_name || ''}`.trim();
          workOrder.customer_id = item.customer.id;
        }
        
        if (item.vehicle) {
          workOrder.vehicle_year = item.vehicle.year?.toString() || '';
          workOrder.vehicle_make = item.vehicle.make || '';
          workOrder.vehicle_model = item.vehicle.model || '';
          workOrder.vehicle_vin = item.vehicle.vin || '';
          workOrder.vehicle_license_plate = item.vehicle.license_plate || '';
        }
        
        if (item.technician) {
          workOrder.technician = `${item.technician.first_name || ''} ${item.technician.last_name || ''}`.trim();
        }

        return workOrder;
      } catch (err) {
        console.error('getAllWorkOrders: Error normalizing work order:', err);
        return null;
      }
    }).filter(Boolean);

    console.log('getAllWorkOrders: Processed work orders:', workOrders.length);
    return workOrders;
  } catch (error) {
    console.error('getAllWorkOrders: Error fetching work orders:', error);
    throw error;
  }
};

/**
 * Get work order by ID with related data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder> => {
  try {
    console.log('getWorkOrderById: Fetching work order with ID:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email, phone),
        vehicle:vehicles(id, year, make, model, vin, license_plate),
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        advisor:profiles!work_orders_advisor_id_fkey(id, first_name, last_name, email)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('getWorkOrderById: Supabase error:', error);
      throw new Error(`Failed to fetch work order: ${error.message}`);
    }

    if (!data) {
      throw new Error('Work order not found');
    }

    console.log('getWorkOrderById: Raw data from Supabase:', data);

    // Create the base work order from the normalized data
    const workOrder = normalizeWorkOrder(data);
    
    // Add related data if available
    if (data.customer) {
      workOrder.customer = `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim();
      workOrder.customer_id = data.customer.id;
    }
    
    if (data.vehicle) {
      workOrder.vehicle_year = data.vehicle.year?.toString() || '';
      workOrder.vehicle_make = data.vehicle.make || '';
      workOrder.vehicle_model = data.vehicle.model || '';
      workOrder.vehicle_vin = data.vehicle.vin || '';
      workOrder.vehicle_license_plate = data.vehicle.license_plate || '';
    }
    
    if (data.technician) {
      workOrder.technician = `${data.technician.first_name || ''} ${data.technician.last_name || ''}`.trim();
    }

    console.log('getWorkOrderById: Processed work order:', workOrder);
    return workOrder;
  } catch (error) {
    console.error('getWorkOrderById: Error fetching work order:', error);
    throw error;
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
        customer:customers(id, first_name, last_name, email, phone),
        vehicle:vehicles(id, year, make, model, vin, license_plate),
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        advisor:profiles!work_orders_advisor_id_fkey(id, first_name, last_name, email)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrdersByCustomerId: Supabase error:', error);
      throw new Error(`Failed to fetch work orders for customer: ${error.message}`);
    }

    if (!data) {
      console.log('getWorkOrdersByCustomerId: No data returned');
      return [];
    }

    // Transform the data to match our WorkOrder type
    const workOrders = data.map((item: any) => {
      try {
        const workOrder = normalizeWorkOrder(item);
        
        if (item.customer) {
          workOrder.customer = `${item.customer.first_name || ''} ${item.customer.last_name || ''}`.trim();
          workOrder.customer_id = item.customer.id;
        }
        
        if (item.vehicle) {
          workOrder.vehicle_year = item.vehicle.year?.toString() || '';
          workOrder.vehicle_make = item.vehicle.make || '';
          workOrder.vehicle_model = item.vehicle.model || '';
          workOrder.vehicle_vin = item.vehicle.vin || '';
          workOrder.vehicle_license_plate = item.vehicle.license_plate || '';
        }
        
        if (item.technician) {
          workOrder.technician = `${item.technician.first_name || ''} ${item.technician.last_name || ''}`.trim();
        }

        return workOrder;
      } catch (err) {
        console.error('getWorkOrdersByCustomerId: Error normalizing work order:', err);
        return null;
      }
    }).filter(Boolean);

    console.log('getWorkOrdersByCustomerId: Processed work orders:', workOrders.length);
    return workOrders;
  } catch (error) {
    console.error('getWorkOrdersByCustomerId: Error fetching work orders:', error);
    throw error;
  }
};

/**
 * Get work orders by status
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersByStatus: Fetching work orders with status:', status);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email, phone),
        vehicle:vehicles(id, year, make, model, vin, license_plate),
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        advisor:profiles!work_orders_advisor_id_fkey(id, first_name, last_name, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrdersByStatus: Supabase error:', error);
      throw new Error(`Failed to fetch work orders by status: ${error.message}`);
    }

    if (!data) {
      console.log('getWorkOrdersByStatus: No data returned');
      return [];
    }

    // Transform the data to match our WorkOrder type
    const workOrders = data.map((item: any) => {
      try {
        const workOrder = normalizeWorkOrder(item);
        
        if (item.customer) {
          workOrder.customer = `${item.customer.first_name || ''} ${item.customer.last_name || ''}`.trim();
          workOrder.customer_id = item.customer.id;
        }
        
        if (item.vehicle) {
          workOrder.vehicle_year = item.vehicle.year?.toString() || '';
          workOrder.vehicle_make = item.vehicle.make || '';
          workOrder.vehicle_model = item.vehicle.model || '';
          workOrder.vehicle_vin = item.vehicle.vin || '';
          workOrder.vehicle_license_plate = item.vehicle.license_plate || '';
        }
        
        if (item.technician) {
          workOrder.technician = `${item.technician.first_name || ''} ${item.technician.last_name || ''}`.trim();
        }

        return workOrder;
      } catch (err) {
        console.error('getWorkOrdersByStatus: Error normalizing work order:', err);
        return null;
      }
    }).filter(Boolean);

    console.log('getWorkOrdersByStatus: Processed work orders:', workOrders.length);
    return workOrders;
  } catch (error) {
    console.error('getWorkOrdersByStatus: Error fetching work orders:', error);
    throw error;
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<{ id: string; name: string }[]> => {
  try {
    console.log('getUniqueTechnicians: Fetching unique technicians...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        technician_id,
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name)
      `)
      .not('technician_id', 'is', null);

    if (error) {
      console.error('getUniqueTechnicians: Supabase error:', error);
      throw new Error(`Failed to fetch technicians: ${error.message}`);
    }

    if (!data) {
      console.log('getUniqueTechnicians: No data returned');
      return [];
    }

    // Create a map to ensure uniqueness
    const techMap = new Map<string, { id: string; name: string }>();
    
    data.forEach((item: any) => {
      if (item.technician && item.technician_id) {
        const name = `${item.technician.first_name || ''} ${item.technician.last_name || ''}`.trim();
        if (name && !techMap.has(item.technician_id)) {
          techMap.set(item.technician_id, {
            id: item.technician_id,
            name: name
          });
        }
      }
    });

    const technicians = Array.from(techMap.values());
    console.log('getUniqueTechnicians: Processed technicians:', technicians.length);
    return technicians;
  } catch (error) {
    console.error('getUniqueTechnicians: Error fetching technicians:', error);
    throw error;
  }
};
