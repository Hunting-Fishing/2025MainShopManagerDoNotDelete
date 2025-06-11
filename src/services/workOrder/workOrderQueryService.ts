import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { normalizeWorkOrder } from '@/utils/workOrders/formatters';

/**
 * Enhanced work order enrichment with robust error handling
 */
export const enrichWorkOrderWithRelatedData = async (workOrder: any): Promise<WorkOrder> => {
  try {
    console.log('Enriching work order:', workOrder.id);
    
    let enrichedWorkOrder = { ...workOrder };

    // Enrich with customer data if customer_id exists
    if (workOrder.customer_id) {
      try {
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('id, first_name, last_name, email, phone')
          .eq('id', workOrder.customer_id)
          .maybeSingle();

        if (customerError) {
          console.error('Error fetching customer:', customerError);
        } else if (customer) {
          enrichedWorkOrder.customer_name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
          enrichedWorkOrder.customer_email = customer.email;
          enrichedWorkOrder.customer_phone = customer.phone;
          enrichedWorkOrder.customer = enrichedWorkOrder.customer_name; // Backward compatibility
        }
      } catch (error) {
        console.error('Failed to enrich customer data:', error);
      }
    }

    // Enrich with vehicle data if vehicle_id exists
    if (workOrder.vehicle_id) {
      try {
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, year, make, model, vin, license_plate')
          .eq('id', workOrder.vehicle_id)
          .maybeSingle();

        if (vehicleError) {
          console.error('Error fetching vehicle:', vehicleError);
        } else if (vehicle) {
          enrichedWorkOrder.vehicle_year = vehicle.year?.toString() || '';
          enrichedWorkOrder.vehicle_make = vehicle.make || '';
          enrichedWorkOrder.vehicle_model = vehicle.model || '';
          enrichedWorkOrder.vehicle_vin = vehicle.vin || '';
          enrichedWorkOrder.vehicle_license_plate = vehicle.license_plate || '';
          enrichedWorkOrder.vehicle = vehicle; // Store full vehicle object
        }
      } catch (error) {
        console.error('Failed to enrich vehicle data:', error);
      }
    }

    // Enrich with technician data if technician_id exists
    if (workOrder.technician_id) {
      try {
        const { data: technician, error: technicianError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('id', workOrder.technician_id)
          .maybeSingle();

        if (technicianError) {
          console.error('Error fetching technician:', technicianError);
        } else if (technician) {
          enrichedWorkOrder.technician = `${technician.first_name || ''} ${technician.last_name || ''}`.trim();
        }
      } catch (error) {
        console.error('Failed to enrich technician data:', error);
      }
    }

    // Normalize the work order to ensure consistent structure
    return normalizeWorkOrder(enrichedWorkOrder);
  } catch (error) {
    console.error('Error enriching work order:', error);
    // Return normalized work order even if enrichment fails
    return normalizeWorkOrder(workOrder);
  }
};

/**
 * Get all work orders with proper enrichment
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders...');
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('No work orders found');
      return [];
    }

    console.log(`Found ${workOrders.length} work orders, enriching data...`);

    // Enrich all work orders with related data
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (workOrder) => {
        try {
          return await enrichWorkOrderWithRelatedData(workOrder);
        } catch (error) {
          console.error(`Failed to enrich work order ${workOrder.id}:`, error);
          // Return normalized work order even if enrichment fails
          return normalizeWorkOrder(workOrder);
        }
      })
    );

    console.log('Work orders enriched successfully');
    return enrichedWorkOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get work order by ID with enrichment
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);
    
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching work order:', error);
      throw new Error(`Failed to fetch work order: ${error.message}`);
    }

    if (!workOrder) {
      console.log('Work order not found');
      return null;
    }

    // Enrich the work order with related data
    const enrichedWorkOrder = await enrichWorkOrderWithRelatedData(workOrder);
    console.log('Work order enriched successfully');
    
    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

/**
 * Get work orders by customer ID with enrichment
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders for customer:', customerId);
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('No work orders found for customer');
      return [];
    }

    console.log(`Found ${workOrders.length} work orders for customer, enriching data...`);

    // Enrich all work orders with related data
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (workOrder) => {
        try {
          return await enrichWorkOrderWithRelatedData(workOrder);
        } catch (error) {
          console.error(`Failed to enrich work order ${workOrder.id}:`, error);
          return normalizeWorkOrder(workOrder);
        }
      })
    );

    console.log('Customer work orders enriched successfully');
    return enrichedWorkOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
};

/**
 * Get work orders by status with enrichment
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders by status:', status);
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('No work orders found for status');
      return [];
    }

    console.log(`Found ${workOrders.length} work orders for status, enriching data...`);

    // Enrich all work orders with related data
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (workOrder) => {
        try {
          return await enrichWorkOrderWithRelatedData(workOrder);
        } catch (error) {
          console.error(`Failed to enrich work order ${workOrder.id}:`, error);
          return normalizeWorkOrder(workOrder);
        }
      })
    );

    console.log('Status work orders enriched successfully');
    return enrichedWorkOrders;
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
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      return [];
    }

    // Get unique technician IDs
    const technicianIds = [...new Set(workOrders.map(wo => wo.technician_id).filter(Boolean))];
    
    if (technicianIds.length === 0) {
      return [];
    }

    // Fetch technician profiles
    const { data: technicians, error: techError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', technicianIds);

    if (techError) {
      console.error('Error fetching technician profiles:', techError);
      return [];
    }

    // Return formatted technician names
    return technicians.map(tech => 
      `${tech.first_name || ''} ${tech.last_name || ''}`.trim()
    ).filter(name => name.length > 0);
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};

/**
 * Get time entries for a work order
 */
export async function getWorkOrderTimeEntries(workOrderId: string): Promise<TimeEntry[]> {
  try {
    console.log('getWorkOrderTimeEntries: Fetching time entries for work order:', workOrderId);
    
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('getWorkOrderTimeEntries: Error:', error);
      throw error;
    }

    console.log('getWorkOrderTimeEntries: Successfully fetched time entries:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('getWorkOrderTimeEntries: Failed to fetch time entries:', error);
    throw error;
  }
}

/**
 * Get inventory items for a work order
 */
export async function getWorkOrderInventoryItems(workOrderId: string) {
  try {
    console.log('getWorkOrderInventoryItems: Fetching inventory items for work order:', workOrderId);
    
    const { data, error } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrderInventoryItems: Error:', error);
      throw error;
    }

    console.log('getWorkOrderInventoryItems: Successfully fetched inventory items:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('getWorkOrderInventoryItems: Failed to fetch inventory items:', error);
    throw error;
  }
}
