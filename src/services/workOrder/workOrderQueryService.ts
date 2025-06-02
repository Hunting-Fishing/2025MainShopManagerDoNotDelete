import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
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

    if (!workOrders) {
      console.log('No work orders found');
      return [];
    }

    // Fetch customer and vehicle data separately for each work order
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (workOrder) => {
        return enrichWorkOrderWithRelatedData(workOrder);
      })
    );

    console.log('Work orders fetched and enriched:', enrichedWorkOrders);
    return enrichedWorkOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);
    
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

    // Fetch customer data if customer_id exists
    let customerData = null;
    if (workOrder.customer_id) {
      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('first_name, last_name, email, phone')
          .eq('id', workOrder.customer_id)
          .single();
        
        if (customer) {
          customerData = {
            customer_name: `${customer.first_name} ${customer.last_name}`,
            customer_email: customer.email,
            customer_phone: customer.phone
          };
        }
      } catch (err) {
        console.warn(`Could not fetch customer data for work order ${workOrder.id}:`, err);
      }
    }

    // Fetch vehicle data if vehicle_id exists
    let vehicleData = null;
    if (workOrder.vehicle_id) {
      try {
        const { data: vehicle } = await supabase
          .from('vehicles')
          .select('year, make, model, vin, license_plate')
          .eq('id', workOrder.vehicle_id)
          .single();
        
        if (vehicle) {
          vehicleData = {
            vehicle_year: vehicle.year?.toString() || '',
            vehicle_make: vehicle.make || '',
            vehicle_model: vehicle.model || '',
            vehicle_vin: vehicle.vin || '',
            vehicle_license_plate: vehicle.license_plate || '',
            vehicle: {
              id: vehicle.id,
              year: vehicle.year,
              make: vehicle.make,
              model: vehicle.model,
              vin: vehicle.vin,
              license_plate: vehicle.license_plate
            }
          };
        }
      } catch (err) {
        console.warn(`Could not fetch vehicle data for work order ${workOrder.id}:`, err);
      }
    }

    const enrichedWorkOrder = {
      ...workOrder,
      ...customerData,
      ...vehicleData
    };

    console.log('Work order fetched and enriched:', enrichedWorkOrder);
    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
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
      throw error;
    }

    if (!workOrders) {
      console.log('No work orders found for status');
      return [];
    }

    // Fetch customer and vehicle data separately for each work order
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (workOrder) => {
        let customerData = null;
        let vehicleData = null;

        // Fetch customer data if customer_id exists
        if (workOrder.customer_id) {
          try {
            const { data: customer } = await supabase
              .from('customers')
              .select('first_name, last_name, email, phone')
              .eq('id', workOrder.customer_id)
              .single();
            
            if (customer) {
              customerData = {
                customer_name: `${customer.first_name} ${customer.last_name}`,
                customer_email: customer.email,
                customer_phone: customer.phone
              };
            }
          } catch (err) {
            console.warn(`Could not fetch customer data for work order ${workOrder.id}:`, err);
          }
        }

        // Fetch vehicle data if vehicle_id exists
        if (workOrder.vehicle_id) {
          try {
            const { data: vehicle } = await supabase
              .from('vehicles')
              .select('year, make, model, vin, license_plate')
              .eq('id', workOrder.vehicle_id)
              .single();
            
            if (vehicle) {
              vehicleData = {
                vehicle_year: vehicle.year?.toString() || '',
                vehicle_make: vehicle.make || '',
                vehicle_model: vehicle.model || '',
                vehicle_vin: vehicle.vin || '',
                vehicle_license_plate: vehicle.license_plate || ''
              };
            }
          } catch (err) {
            console.warn(`Could not fetch vehicle data for work order ${workOrder.id}:`, err);
          }
        }

        return {
          ...workOrder,
          ...customerData,
          ...vehicleData
        };
      })
    );

    console.log('Work orders by status fetched and enriched:', enrichedWorkOrders);
    return enrichedWorkOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
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
      console.error('Error fetching technicians:', error);
      throw error;
    }

    const uniqueTechnicians = [...new Set(data?.map(wo => wo.technician_id).filter(Boolean))];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};

/**
 * Enriches work order data with customer and vehicle information
 */
async function enrichWorkOrderWithRelatedData(workOrder: any): Promise<WorkOrder> {
  const enrichedWorkOrder: WorkOrder = {
    ...workOrder,
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_vin: '',
    vehicle_license_plate: '',
  };

  // Fetch customer data if customer_id exists
  if (workOrder.customer_id) {
    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('first_name, last_name, email, phone')
        .eq('id', workOrder.customer_id)
        .maybeSingle();

      if (customerError) {
        console.warn('Error fetching customer:', customerError);
      } else if (customer) {
        enrichedWorkOrder.customer_name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        enrichedWorkOrder.customer_email = customer.email || '';
        enrichedWorkOrder.customer_phone = customer.phone || '';
      }
    } catch (error) {
      console.warn('Error enriching work order with customer data:', error);
    }
  }

  // Fetch vehicle data if vehicle_id exists
  if (workOrder.vehicle_id) {
    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id, year, make, model, vin, license_plate')
        .eq('id', workOrder.vehicle_id)
        .maybeSingle();

      if (vehicleError) {
        console.warn('Error fetching vehicle:', vehicleError);
      } else if (vehicleData) {
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
          license_plate: vehicleData.license_plate,
        };
      }
    } catch (error) {
      console.warn('Error enriching work order with vehicle data:', error);
    }
  }

  return enrichedWorkOrder;
}
