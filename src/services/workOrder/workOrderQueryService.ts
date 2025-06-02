import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

/**
 * Get all work orders with enhanced data including customer and vehicle details
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders with enhanced details...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          zip
        ),
        vehicle:vehicles (
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
    const transformedData = data?.map(workOrder => {
      const transformed = {
        ...workOrder,
        // Flatten customer data
        customer_name: workOrder.customer ? 
          `${workOrder.customer.first_name || ''} ${workOrder.customer.last_name || ''}`.trim() : 
          'Unknown Customer',
        customer_email: workOrder.customer?.email,
        customer_phone: workOrder.customer?.phone,
        customer_address: workOrder.customer?.address,
        customer_city: workOrder.customer?.city,
        customer_state: workOrder.customer?.state,
        customer_zip: workOrder.customer?.zip,
        
        // Flatten vehicle data
        vehicle_year: workOrder.vehicle?.year?.toString(),
        vehicle_make: workOrder.vehicle?.make,
        vehicle_model: workOrder.vehicle?.model,
        vehicle_vin: workOrder.vehicle?.vin,
        vehicle_license_plate: workOrder.vehicle?.license_plate,
        
        // Keep the nested vehicle object for backward compatibility
        vehicle: workOrder.vehicle,
        
        // Legacy fields for UI compatibility
        customer: workOrder.customer ? 
          `${workOrder.customer.first_name || ''} ${workOrder.customer.last_name || ''}`.trim() : 
          'Unknown Customer',
        date: workOrder.created_at,
        dueDate: workOrder.end_time || workOrder.created_at,
        technician: 'Unassigned', // TODO: Add technician lookup
        priority: 'medium', // TODO: Add priority field to database
        location: 'Shop', // TODO: Add location field to database
        notes: workOrder.description || '',
        total_billable_time: 0 // TODO: Calculate from time entries
      };
      
      // Remove the nested objects to avoid confusion
      delete transformed.customer;
      delete transformed.vehicle;
      
      return transformed;
    }) || [];

    console.log('Transformed work orders:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get a single work order by ID with full details
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);
    
    // First try using the new database function
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_work_order_with_details', { work_order_id: id });
    
    if (!functionError && functionData && functionData.length > 0) {
      const workOrderData = functionData[0];
      console.log('Work order data from function:', workOrderData);
      
      // Transform function result to WorkOrder format
      const transformed: WorkOrder = {
        id: workOrderData.id,
        customer_id: workOrderData.customer_id,
        vehicle_id: workOrderData.vehicle_id,
        advisor_id: workOrderData.advisor_id,
        technician_id: workOrderData.technician_id,
        estimated_hours: workOrderData.estimated_hours,
        total_cost: workOrderData.total_cost,
        created_by: workOrderData.created_by,
        created_at: workOrderData.created_at,
        updated_at: workOrderData.updated_at,
        start_time: workOrderData.start_time,
        end_time: workOrderData.end_time,
        service_category_id: workOrderData.service_category_id,
        invoiced_at: workOrderData.invoiced_at,
        status: workOrderData.status,
        description: workOrderData.description,
        service_type: workOrderData.service_type,
        invoice_id: workOrderData.invoice_id,
        
        // Customer information
        customer_name: `${workOrderData.customer_first_name || ''} ${workOrderData.customer_last_name || ''}`.trim() || 'Unknown Customer',
        customer_email: workOrderData.customer_email,
        customer_phone: workOrderData.customer_phone,
        
        // Vehicle information
        vehicle_year: workOrderData.vehicle_year,
        vehicle_make: workOrderData.vehicle_make,
        vehicle_model: workOrderData.vehicle_model,
        vehicle_vin: workOrderData.vehicle_vin,
        vehicle_license_plate: workOrderData.vehicle_license_plate,
        
        // Vehicle object for backward compatibility
        vehicle: workOrderData.vehicle_make ? {
          id: workOrderData.vehicle_id,
          year: workOrderData.vehicle_year,
          make: workOrderData.vehicle_make,
          model: workOrderData.vehicle_model,
          vin: workOrderData.vehicle_vin,
          license_plate: workOrderData.vehicle_license_plate
        } : undefined,
        
        // Legacy UI fields
        customer: `${workOrderData.customer_first_name || ''} ${workOrderData.customer_last_name || ''}`.trim() || 'Unknown Customer',
        date: workOrderData.created_at,
        dueDate: workOrderData.end_time || workOrderData.created_at,
        technician: 'Unassigned', // TODO: Add technician lookup
        priority: 'medium', // TODO: Add priority field
        location: 'Shop', // TODO: Add location field
        notes: workOrderData.description || '',
        total_billable_time: 0 // TODO: Calculate from time entries
      };
      
      return transformed;
    }
    
    // Fallback to regular query if function fails
    console.log('Function failed, falling back to regular query');
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicle:vehicles (
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
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('Work order not found:', id);
      return null;
    }

    console.log('Work order data from fallback:', data);
    
    // Transform the data similar to getAllWorkOrders
    const transformed: WorkOrder = {
      ...data,
      customer_name: data.customer ? 
        `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim() : 
        'Unknown Customer',
      customer_email: data.customer?.email,
      customer_phone: data.customer?.phone,
      
      vehicle_year: data.vehicle?.year?.toString(),
      vehicle_make: data.vehicle?.make,
      vehicle_model: data.vehicle?.model,
      vehicle_vin: data.vehicle?.vin,
      vehicle_license_plate: data.vehicle?.license_plate,
      
      // Keep vehicle object
      vehicle: data.vehicle,
      
      // Legacy fields
      customer: data.customer ? 
        `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim() : 
        'Unknown Customer',
      date: data.created_at,
      dueDate: data.end_time || data.created_at,
      technician: 'Unassigned',
      priority: 'medium',
      location: 'Shop',
      notes: data.description || '',
      total_billable_time: 0
    };

    return transformed;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
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
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicle:vehicles (
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
      throw error;
    }

    return data?.map(normalizeWorkOrder) || [];
  } catch (error) {
    console.error('Error fetching work orders by customer ID:', error);
    return [];
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
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicle:vehicles (
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

    if (error) {
      throw error;
    }

    return data?.map(normalizeWorkOrder) || [];
  } catch (error) {
    console.error('Error fetching work orders by status:', error);
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
      throw error;
    }

    // Extract unique technician IDs
    const uniqueTechnicians = [...new Set(data?.map(item => item.technician_id).filter(Boolean))] || [];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error fetching unique technicians:', error);
    return [];
  }
};
