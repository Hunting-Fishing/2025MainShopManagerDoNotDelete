import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

/**
 * Get all work orders
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders');
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    console.log(`Found ${workOrders?.length} work orders`);
    return workOrders || [];
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get a single work order by ID with enriched customer and vehicle data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order with ID:', id);
    
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!workOrder) {
      console.log('Work order not found');
      return null;
    }

    // Enrich with customer and vehicle data
    const enrichedWorkOrder = await enrichWorkOrderWithRelatedData(workOrder);
    
    console.log('Work order fetched and enriched:', enrichedWorkOrder);
    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

/**
 * Enrich a work order with customer and vehicle data
 */
const enrichWorkOrderWithRelatedData = async (workOrder: any): Promise<WorkOrder> => {
  let enrichedWorkOrder = { ...workOrder };

  // Fetch customer data if customer_id exists
  if (workOrder.customer_id) {
    try {
      const { data: customerData } = await supabase
        .from('customers')
        .select('first_name, last_name, email, phone')
        .eq('id', workOrder.customer_id)
        .single();
      
      if (customerData) {
        enrichedWorkOrder.customer_name = `${customerData.first_name} ${customerData.last_name}`;
        enrichedWorkOrder.customer_email = customerData.email || '';
        enrichedWorkOrder.customer_phone = customerData.phone || '';
      }
    } catch (err) {
      console.warn(`Could not fetch customer data for work order ${workOrder.id}:`, err);
    }
  }

  // Fetch vehicle data if vehicle_id exists
  if (workOrder.vehicle_id) {
    try {
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('id, year, make, model, vin, license_plate')
        .eq('id', workOrder.vehicle_id)
        .single();
      
      if (vehicleData) {
        enrichedWorkOrder.vehicle_year = vehicleData.year?.toString() || '';
        enrichedWorkOrder.vehicle_make = vehicleData.make || '';
        enrichedWorkOrder.vehicle_model = vehicleData.model || '';
        enrichedWorkOrder.vehicle_vin = vehicleData.vin || '';
        enrichedWorkOrder.vehicle_license_plate = vehicleData.license_plate || '';
        
        // Create the vehicle object with the id property from the fetched data
        enrichedWorkOrder.vehicle = {
          id: vehicleData.id,
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          vin: vehicleData.vin,
          license_plate: vehicleData.license_plate
        };
      }
    } catch (err) {
      console.warn(`Could not fetch vehicle data for work order ${workOrder.id}:`, err);
    }
  }

  return enrichedWorkOrder;
};

/**
 * Get work orders by customer ID with enriched customer and vehicle data
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders for customer:', customerId);
    
    // First, fetch basic work order data without embedded relationships
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('No work orders found for customer:', customerId);
      return [];
    }

    console.log(`Found ${workOrders.length} work orders for customer ${customerId}`);

    // Fetch customer and vehicle data separately for each work order
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (workOrder) => {
        return enrichWorkOrderWithRelatedData(workOrder);
      })
    );

    console.log('Enriched work orders:', enrichedWorkOrders);
    return enrichedWorkOrders;
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
    console.log(`Fetching work orders with status: ${status}`);
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching work orders with status ${status}:`, error);
      throw error;
    }

    console.log(`Found ${workOrders?.length} work orders with status ${status}`);
    return workOrders || [];
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
    console.log('Fetching unique technicians from work orders');
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('No work orders found');
      return [];
    }

    // Extract unique technician IDs
    const uniqueTechnicians = [...new Set(workOrders.map(wo => wo.technician_id))];
    
    console.log(`Found ${uniqueTechnicians.length} unique technicians`);
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw error;
  }
};
