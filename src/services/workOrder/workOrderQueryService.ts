
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";

/**
 * Get all work orders with customer and vehicle details
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          postal_code
        ),
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

    console.log('Raw work orders data:', data);

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = data?.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = Array.isArray(wo.vehicles) ? wo.vehicles[0] : wo.vehicles;
      
      return {
        id: wo.id,
        customer_id: wo.customer_id,
        vehicle_id: wo.vehicle_id,
        advisor_id: wo.advisor_id,
        technician_id: wo.technician_id,
        estimated_hours: wo.estimated_hours,
        total_cost: wo.total_cost,
        created_by: wo.created_by,
        created_at: wo.created_at,
        updated_at: wo.updated_at,
        start_time: wo.start_time,
        end_time: wo.end_time,
        service_category_id: wo.service_category_id,
        invoiced_at: wo.invoiced_at,
        status: wo.status,
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        // Vehicle object for new components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,
        // Default empty arrays for related data
        timeEntries: [],
        inventoryItems: [],
        jobLines: []
      };
    }) || [];

    console.log('Transformed work orders:', workOrders);
    return workOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get work order by ID with all related data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          postal_code
        ),
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
      .single();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('No work order found with ID:', id);
      return null;
    }

    console.log('Raw work order data:', data);

    const customer = data.customers;
    const vehicle = Array.isArray(data.vehicles) ? data.vehicles[0] : data.vehicles;

    // Transform to WorkOrder format
    const workOrder: WorkOrder = {
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
      // Customer information
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      customer_zip: customer?.postal_code || '',
      // Vehicle information
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      // Legacy fields for backward compatibility
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      // Vehicle object for new components
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim
      } : undefined,
      // Default empty arrays for related data
      timeEntries: [],
      inventoryItems: [],
      jobLines: []
    };

    console.log('Transformed work order:', workOrder);
    return workOrder;
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
    console.log('Fetching work orders for customer:', customerId);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          postal_code
        ),
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

    // Transform the data
    const workOrders: WorkOrder[] = data?.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = Array.isArray(wo.vehicles) ? wo.vehicles[0] : wo.vehicles;
      
      return {
        id: wo.id,
        customer_id: wo.customer_id,
        vehicle_id: wo.vehicle_id,
        advisor_id: wo.advisor_id,
        technician_id: wo.technician_id,
        estimated_hours: wo.estimated_hours,
        total_cost: wo.total_cost,
        created_by: wo.created_by,
        created_at: wo.created_at,
        updated_at: wo.updated_at,
        start_time: wo.start_time,
        end_time: wo.end_time,
        service_category_id: wo.service_category_id,
        invoiced_at: wo.invoiced_at,
        status: wo.status,
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        // Vehicle object for new components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,
        // Default empty arrays for related data
        timeEntries: [],
        inventoryItems: [],
        jobLines: []
      };
    }) || [];

    console.log('Work orders for customer:', workOrders);
    return workOrders;
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
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          postal_code
        ),
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

    // Transform the data
    const workOrders: WorkOrder[] = data?.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = Array.isArray(wo.vehicles) ? wo.vehicles[0] : wo.vehicles;
      
      return {
        id: wo.id,
        customer_id: wo.customer_id,
        vehicle_id: wo.vehicle_id,
        advisor_id: wo.advisor_id,
        technician_id: wo.technician_id,
        estimated_hours: wo.estimated_hours,
        total_cost: wo.total_cost,
        created_by: wo.created_by,
        created_at: wo.created_at,
        updated_at: wo.updated_at,
        start_time: wo.start_time,
        end_time: wo.end_time,
        service_category_id: wo.service_category_id,
        invoiced_at: wo.invoiced_at,
        status: wo.status,
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        // Vehicle object for new components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,
        // Default empty arrays for related data
        timeEntries: [],
        inventoryItems: [],
        jobLines: []
      };
    }) || [];

    return workOrders;
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
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching unique technicians:', error);
      throw error;
    }

    // Extract unique technician IDs
    const uniqueTechnicians = [...new Set(data?.map(wo => wo.technician_id).filter(Boolean))] as string[];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};
