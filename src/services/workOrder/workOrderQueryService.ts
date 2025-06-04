
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { loadJobLinesFromDatabase } from '../jobLineService';

/**
 * Get all work orders with basic information
 */
export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders...');
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }
    
    // Now that we have the work orders, fetch related data separately
    const enrichedWorkOrders = await enrichWorkOrdersWithRelatedData(workOrders || []);
    
    console.log(`Fetched ${enrichedWorkOrders.length} work orders`);
    return enrichedWorkOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    return [];
  }
}

/**
 * Get a single work order by ID with all related data
 */
export async function getWorkOrderById(workOrderId: string): Promise<WorkOrder | null> {
  try {
    console.log('Fetching work order by ID:', workOrderId);
    
    // Get the base work order data
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', workOrderId)
      .single();
    
    if (error) {
      console.error('Error fetching work order by ID:', error);
      throw error;
    }
    
    if (!workOrder) {
      console.log('Work order not found:', workOrderId);
      return null;
    }
    
    // Get related time entries
    const { data: timeEntries, error: timeEntriesError } = await supabase
      .rpc('get_work_order_time_entries', { work_order_id: workOrderId });
      
    if (timeEntriesError) {
      console.error('Error fetching time entries:', timeEntriesError);
    }
    
    // Get related inventory items
    const { data: inventoryItems, error: inventoryError } = await supabase
      .rpc('get_work_order_inventory_items', { work_order_id: workOrderId });
      
    if (inventoryError) {
      console.error('Error fetching inventory items:', inventoryError);
    }
    
    // Get related job lines
    let jobLines = [];
    try {
      jobLines = await loadJobLinesFromDatabase(workOrderId);
    } catch (jobLinesError) {
      console.error('Error fetching job lines:', jobLinesError);
    }
    
    // Get customer data if customer_id exists
    let customer = null;
    if (workOrder.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', workOrder.customer_id)
        .single();
        
      if (customerError) {
        console.error('Error fetching customer data:', customerError);
      } else {
        customer = customerData;
      }
    }
    
    // Get vehicle data if vehicle_id exists
    let vehicle = null;
    if (workOrder.vehicle_id) {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', workOrder.vehicle_id)
        .single();
        
      if (vehicleError) {
        console.error('Error fetching vehicle data:', vehicleError);
      } else {
        vehicle = vehicleData;
      }
    }
    
    // Get technician data if technician_id exists
    let technician = null;
    if (workOrder.technician_id) {
      const { data: technicianData, error: technicianError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', workOrder.technician_id)
        .single();
        
      if (technicianError) {
        console.error('Error fetching technician data:', technicianError);
      } else {
        technician = technicianData;
      }
    }
    
    // Enrich the work order with related data
    const enrichedWorkOrder: WorkOrder = {
      ...workOrder,
      timeEntries: timeEntries || [],
      inventoryItems: inventoryItems || [],
      jobLines: jobLines || [],
      // Add customer fields if customer data exists
      ...(customer ? {
        customer_name: `${customer.first_name} ${customer.last_name}`,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_city: customer.city,
        customer_state: customer.state,
        customer_zip: customer.postal_code
      } : {}),
      // Add vehicle fields if vehicle data exists
      ...(vehicle ? {
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_year: vehicle.year,
        vehicle_vin: vehicle.vin,
        vehicle_license_plate: vehicle.license_plate,
        // Create a vehicle object that matches the expected format in types
        vehicle: {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim || ''
        }
      } : {}),
      // Add technician name if technician data exists
      ...(technician ? {
        technician: `${technician.first_name} ${technician.last_name}`
      } : {})
    };
    
    console.log('Successfully fetched enriched work order');
    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    return null;
  }
}

/**
 * Utility function to enrich work orders with related data
 */
async function enrichWorkOrdersWithRelatedData(workOrders: any[]): Promise<WorkOrder[]> {
  try {
    // For each work order, fetch the customer name
    const enriched = await Promise.all(workOrders.map(async (workOrder) => {
      let customerName = '';
      let vehicleInfo = '';
      
      // Get customer name if customer_id exists
      if (workOrder.customer_id) {
        const { data: customer, error } = await supabase
          .from('customers')
          .select('first_name, last_name')
          .eq('id', workOrder.customer_id)
          .single();
          
        if (!error && customer) {
          customerName = `${customer.first_name} ${customer.last_name}`;
        }
      }
      
      // Get vehicle info if vehicle_id exists
      if (workOrder.vehicle_id) {
        const { data: vehicle, error } = await supabase
          .from('vehicles')
          .select('year, make, model')
          .eq('id', workOrder.vehicle_id)
          .single();
          
        if (!error && vehicle) {
          vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        }
      }
      
      return {
        ...workOrder,
        customer: customerName,
        vehicle_info: vehicleInfo
      };
    }));
    
    return enriched;
  } catch (error) {
    console.error('Error enriching work orders with related data:', error);
    return workOrders;
  }
}

/**
 * Get unique technicians for work order filter
 */
export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .order('last_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }
    
    // Format technician names
    const technicians = data?.map(tech => 
      `${tech.first_name} ${tech.last_name}`
    ) || [];
    
    return technicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
}

/**
 * Get work orders by customer ID
 */
export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    return [];
  }
}

/**
 * Get work orders by status
 */
export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    return [];
  }
}
