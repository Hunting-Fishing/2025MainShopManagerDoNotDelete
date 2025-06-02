
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

/**
 * Get all work orders with customer and vehicle relationships
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders...');
    
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

    // Transform the data to match WorkOrder interface
    const workOrders: WorkOrder[] = data?.map((wo: any) => {
      return {
        ...wo,
        // Customer information
        customer_name: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : '',
        customer_email: wo.customer?.email || '',
        customer_phone: wo.customer?.phone || '',
        customer_address: '', // Not available in current schema
        customer_city: '', // Not available in current schema
        customer_state: '', // Not available in current schema
        customer_zip: '', // Not available in current schema
        
        // Vehicle information (handle single object, not array)
        vehicle_year: wo.vehicle?.year?.toString() || '',
        vehicle_make: wo.vehicle?.make || '',
        vehicle_model: wo.vehicle?.model || '',
        vehicle_vin: wo.vehicle?.vin || '',
        vehicle_license_plate: wo.vehicle?.license_plate || '',
        
        // Legacy fields for backward compatibility
        customer: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : '',
        
        // Vehicle object for new structure
        vehicle: wo.vehicle ? {
          id: wo.vehicle.id,
          year: wo.vehicle.year,
          make: wo.vehicle.make,
          model: wo.vehicle.model,
          vin: wo.vehicle.vin,
          license_plate: wo.vehicle.license_plate,
          trim: wo.vehicle.trim
        } : undefined
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
 * Get work order by ID with full relationship data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);
    
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
      console.log('Work order not found:', id);
      return null;
    }

    console.log('Raw work order data:', data);

    // Transform the data to match WorkOrder interface
    const workOrder: WorkOrder = {
      ...data,
      // Customer information
      customer_name: data.customer ? `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim() : '',
      customer_email: data.customer?.email || '',
      customer_phone: data.customer?.phone || '',
      customer_address: '', // Not available in current schema
      customer_city: '', // Not available in current schema
      customer_state: '', // Not available in current schema
      customer_zip: '', // Not available in current schema
      
      // Vehicle information (handle single object, not array)
      vehicle_year: data.vehicle?.year?.toString() || '',
      vehicle_make: data.vehicle?.make || '',
      vehicle_model: data.vehicle?.model || '',
      vehicle_vin: data.vehicle?.vin || '',
      vehicle_license_plate: data.vehicle?.license_plate || '',
      
      // Legacy fields for backward compatibility
      customer: data.customer ? `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim() : '',
      
      // Vehicle object for new structure
      vehicle: data.vehicle ? {
        id: data.vehicle.id,
        year: data.vehicle.year,
        make: data.vehicle.make,
        model: data.vehicle.model,
        vin: data.vehicle.vin,
        license_plate: data.vehicle.license_plate,
        trim: data.vehicle.trim
      } : undefined
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

    // Transform the data similar to getAllWorkOrders
    const workOrders: WorkOrder[] = data?.map((wo: any) => ({
      ...wo,
      customer_name: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : '',
      customer_email: wo.customer?.email || '',
      customer_phone: wo.customer?.phone || '',
      customer_address: '',
      customer_city: '',
      customer_state: '',
      customer_zip: '',
      vehicle_year: wo.vehicle?.year?.toString() || '',
      vehicle_make: wo.vehicle?.make || '',
      vehicle_model: wo.vehicle?.model || '',
      vehicle_vin: wo.vehicle?.vin || '',
      vehicle_license_plate: wo.vehicle?.license_plate || '',
      customer: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : '',
      vehicle: wo.vehicle ? {
        id: wo.vehicle.id,
        year: wo.vehicle.year,
        make: wo.vehicle.make,
        model: wo.vehicle.model,
        vin: wo.vehicle.vin,
        license_plate: wo.vehicle.license_plate,
        trim: wo.vehicle.trim
      } : undefined
    })) || [];

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
    console.log('Fetching work orders by status:', status);
    
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

    // Transform the data similar to getAllWorkOrders
    const workOrders: WorkOrder[] = data?.map((wo: any) => ({
      ...wo,
      customer_name: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : '',
      customer_email: wo.customer?.email || '',
      customer_phone: wo.customer?.phone || '',
      customer_address: '',
      customer_city: '',
      customer_state: '',
      customer_zip: '',
      vehicle_year: wo.vehicle?.year?.toString() || '',
      vehicle_make: wo.vehicle?.make || '',
      vehicle_model: wo.vehicle?.model || '',
      vehicle_vin: wo.vehicle?.vin || '',
      vehicle_license_plate: wo.vehicle?.license_plate || '',
      customer: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : '',
      vehicle: wo.vehicle ? {
        id: wo.vehicle.id,
        year: wo.vehicle.year,
        make: wo.vehicle.make,
        model: wo.vehicle.model,
        vin: wo.vehicle.vin,
        license_plate: wo.vehicle.license_plate,
        trim: wo.vehicle.trim
      } : undefined
    })) || [];

    console.log('Work orders by status:', workOrders);
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
    console.log('Fetching unique technicians...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    // Extract unique technician IDs
    const uniqueTechnicians = [...new Set(data?.map(wo => wo.technician_id).filter(Boolean))] || [];
    
    console.log('Unique technicians:', uniqueTechnicians);
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};

/**
 * Get work orders with time entries
 */
export const getWorkOrdersWithTimeEntries = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders with time entries...');
    
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
          license_plate,
          trim
        ),
        timeEntries:work_order_time_entries (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders with time entries:', error);
      throw error;
    }

    // Transform the data and include time entries
    const workOrders: WorkOrder[] = data?.map((wo: any) => ({
      ...wo,
      customer_name: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : '',
      customer_email: wo.customer?.email || '',
      customer_phone: wo.customer?.phone || '',
      customer_address: '',
      customer_city: '',
      customer_state: '',
      customer_zip: '',
      vehicle_year: wo.vehicle?.year?.toString() || '',
      vehicle_make: wo.vehicle?.make || '',
      vehicle_model: wo.vehicle?.model || '',
      vehicle_vin: wo.vehicle?.vin || '',
      vehicle_license_plate: wo.vehicle?.license_plate || '',
      customer: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : '',
      vehicle: wo.vehicle ? {
        id: wo.vehicle.id,
        year: wo.vehicle.year,
        make: wo.vehicle.make,
        model: wo.vehicle.model,
        vin: wo.vehicle.vin,
        license_plate: wo.vehicle.license_plate,
        trim: wo.vehicle.trim
      } : undefined,
      timeEntries: wo.timeEntries || []
    })) || [];

    console.log('Work orders with time entries:', workOrders);
    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersWithTimeEntries:', error);
    throw error;
  }
};
