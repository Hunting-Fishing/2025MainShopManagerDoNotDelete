import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

/**
 * Get all work orders with customer and vehicle information
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Querying work_orders table with customer and vehicle data...');
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles!vehicle_id (
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
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Raw data from database:', data);
    const normalizedData = data?.map(workOrder => {
      const normalized = normalizeWorkOrder(workOrder);
      
      // Add customer information if available
      if (workOrder.customers) {
        const customer = workOrder.customers;
        normalized.customer_name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        normalized.customer_email = customer.email;
        normalized.customer_phone = customer.phone;
        normalized.customer = normalized.customer_name; // For backward compatibility
      }
      
      // NEW: Add vehicle information if available
      if (workOrder.vehicles) {
        const vehicle = workOrder.vehicles;
        normalized.vehicle_make = vehicle.make;
        normalized.vehicle_model = vehicle.model;
        normalized.vehicle_year = vehicle.year?.toString();
        normalized.vehicle_vin = vehicle.vin;
        normalized.vehicle_license_plate = vehicle.license_plate;
        // Store the vehicle object for easier access
        normalized.vehicle = vehicle;
      }
      
      return normalized;
    }) || [];
    
    console.log('Normalized work orders:', normalizedData);
    return normalizedData;
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return [];
  }
};

/**
 * Get a work order by ID with customer and vehicle information
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles!vehicle_id (
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
      .single();
      
    if (error) {
      throw error;
    }
    
    const normalized = normalizeWorkOrder(data);
    
    // Add customer information if available
    if (data.customers) {
      const customer = data.customers;
      normalized.customer_name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
      normalized.customer_email = customer.email;
      normalized.customer_phone = customer.phone;
      normalized.customer = normalized.customer_name; // For backward compatibility
    }
    
    // NEW: Add vehicle information if available
    if (data.vehicles) {
      const vehicle = data.vehicles;
      normalized.vehicle_make = vehicle.make;
      normalized.vehicle_model = vehicle.model;
      normalized.vehicle_year = vehicle.year?.toString();
      normalized.vehicle_vin = vehicle.vin;
      normalized.vehicle_license_plate = vehicle.license_plate;
      normalized.vehicle = vehicle;
    }
    
    return normalized;
  } catch (error) {
    console.error(`Error fetching work order ${id}:`, error);
    return null;
  }
};

/**
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles!vehicle_id (
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
      throw error;
    }
    
    return data?.map(workOrder => {
      const normalized = normalizeWorkOrder(workOrder);
      
      // Add customer information if available
      if (workOrder.customers) {
        const customer = workOrder.customers;
        normalized.customer_name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        normalized.customer_email = customer.email;
        normalized.customer_phone = customer.phone;
        normalized.customer = normalized.customer_name;
      }
      
      // NEW: Add vehicle information if available
      if (workOrder.vehicles) {
        const vehicle = workOrder.vehicles;
        normalized.vehicle_make = vehicle.make;
        normalized.vehicle_model = vehicle.model;
        normalized.vehicle_year = vehicle.year?.toString();
        normalized.vehicle_vin = vehicle.vin;
        normalized.vehicle_license_plate = vehicle.license_plate;
        normalized.vehicle = vehicle;
      }
      
      return normalized;
    }) || [];
  } catch (error) {
    console.error(`Error fetching work orders for customer ${customerId}:`, error);
    return [];
  }
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data?.map(normalizeWorkOrder) || [];
  } catch (error) {
    console.error(`Error fetching work orders with status ${status}:`, error);
    return [];
  }
};

export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);
      
    if (error) {
      throw error;
    }
    
    // Filter out nulls and duplicates
    return [...new Set(data?.map(item => item.technician_id).filter(Boolean))];
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return [];
  }
};
