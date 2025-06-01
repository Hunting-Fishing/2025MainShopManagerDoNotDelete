
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';

// Get all work orders with enhanced data
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
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

    if (!data) {
      return [];
    }

    // Transform the data to match our WorkOrder interface
    return data.map((workOrder: any) => {
      const transformedWorkOrder: WorkOrder = {
        id: workOrder.id,
        customer_id: workOrder.customer_id,
        vehicle_id: workOrder.vehicle_id,
        advisor_id: workOrder.advisor_id,
        technician_id: workOrder.technician_id,
        estimated_hours: workOrder.estimated_hours,
        total_cost: workOrder.total_cost,
        created_by: workOrder.created_by,
        created_at: workOrder.created_at,
        updated_at: workOrder.updated_at,
        start_time: workOrder.start_time,
        end_time: workOrder.end_time,
        service_category_id: workOrder.service_category_id,
        invoiced_at: workOrder.invoiced_at,
        status: workOrder.status,
        description: workOrder.description,
        service_type: workOrder.service_type,
        invoice_id: workOrder.invoice_id,
        
        // Add vehicle data if available
        ...(workOrder.vehicles && {
          vehicle: {
            id: workOrder.vehicles.id,
            year: workOrder.vehicles.year,
            make: workOrder.vehicles.make,
            model: workOrder.vehicles.model,
            vin: workOrder.vehicles.vin,
            license_plate: workOrder.vehicles.license_plate,
            trim: workOrder.vehicles.trim
          }
        })
      };

      return transformedWorkOrder;
    });

  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

// Get work order by ID
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
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
      return null;
    }

    const transformedWorkOrder: WorkOrder = {
      id: data.id,
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      advisor_id: data.advisor_id,
      technician_id: data.technician_id,
      estimated_hours: data.estimated_hours,
      total_cost: data.total_cost,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      start_time: data.start_time,
      end_time: data.end_time,
      service_category_id: data.service_category_id,
      invoiced_at: data.invoiced_at,
      status: data.status,
      description: data.description,
      service_type: data.service_type,
      invoice_id: data.invoice_id,
      
      // Add vehicle data if available
      ...(data.vehicles && {
        vehicle: {
          id: data.vehicles.id,
          year: data.vehicles.year,
          make: data.vehicles.make,
          model: data.vehicles.model,
          vin: data.vehicles.vin,
          license_plate: data.vehicles.license_plate,
          trim: data.vehicles.trim
        }
      })
    };

    return transformedWorkOrder;

  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

// Get work orders by customer ID
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
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
      console.error('Error fetching work orders by customer:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map((workOrder: any) => ({
      id: workOrder.id,
      customer_id: workOrder.customer_id,
      vehicle_id: workOrder.vehicle_id,
      advisor_id: workOrder.advisor_id,
      technician_id: workOrder.technician_id,
      estimated_hours: workOrder.estimated_hours,
      total_cost: workOrder.total_cost,
      created_by: workOrder.created_by,
      created_at: workOrder.created_at,
      updated_at: workOrder.updated_at,
      start_time: workOrder.start_time,
      end_time: workOrder.end_time,
      service_category_id: workOrder.service_category_id,
      invoiced_at: workOrder.invoiced_at,
      status: workOrder.status,
      description: workOrder.description,
      service_type: workOrder.service_type,
      invoice_id: workOrder.invoice_id,
      
      // Add vehicle data if available
      ...(workOrder.vehicles && {
        vehicle: {
          id: workOrder.vehicles.id,
          year: workOrder.vehicles.year,
          make: workOrder.vehicles.make,
          model: workOrder.vehicles.model,
          vin: workOrder.vehicles.vin,
          license_plate: workOrder.vehicles.license_plate,
          trim: workOrder.vehicles.trim
        }
      })
    }));

  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
};

// Get work orders by status
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
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

    if (!data) {
      return [];
    }

    return data.map((workOrder: any) => ({
      id: workOrder.id,
      customer_id: workOrder.customer_id,
      vehicle_id: workOrder.vehicle_id,
      advisor_id: workOrder.advisor_id,
      technician_id: workOrder.technician_id,
      estimated_hours: workOrder.estimated_hours,
      total_cost: workOrder.total_cost,
      created_by: workOrder.created_by,
      created_at: workOrder.created_at,
      updated_at: workOrder.updated_at,
      start_time: workOrder.start_time,
      end_time: workOrder.end_time,
      service_category_id: workOrder.service_category_id,
      invoiced_at: workOrder.invoiced_at,
      status: workOrder.status,
      description: workOrder.description,
      service_type: workOrder.service_type,
      invoice_id: workOrder.invoice_id,
      
      // Add vehicle data if available
      ...(workOrder.vehicles && {
        vehicle: {
          id: workOrder.vehicles.id,
          year: workOrder.vehicles.year,
          make: workOrder.vehicles.make,
          model: workOrder.vehicles.model,
          vin: workOrder.vehicles.vin,
          license_plate: workOrder.vehicles.license_plate,
          trim: workOrder.vehicles.trim
        }
      })
    }));

  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

// Get unique technicians from work orders
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

    if (!data) {
      return [];
    }

    // Extract unique technician IDs and filter out nulls
    const uniqueTechnicians = [...new Set(
      data
        .map(item => item.technician_id)
        .filter(Boolean)
    )];

    return uniqueTechnicians;

  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};
