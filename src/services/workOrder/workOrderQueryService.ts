
import { supabase } from "@/lib/supabase";
import { WorkOrder } from "@/types/workOrder";

/**
 * Get all work orders with enriched data
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
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
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map((workOrder: any) => {
      const customer = workOrder.customers;
      const vehicle = workOrder.vehicles;
      const technician = workOrder.profiles;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
        customer_id: customer?.id || workOrder.customer_id,
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        
        // Vehicle information
        vehicle_year: vehicle?.year || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        vehicle: vehicle || undefined,
        
        // Technician information
        technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
      };
    });

    console.log('Fetched work orders:', workOrders.length);
    return workOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get work order by ID with enriched data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
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
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
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

    const customer = data.customers;
    const vehicle = data.vehicles;
    const technician = data.profiles;

    const workOrder: WorkOrder = {
      ...data,
      // Customer information
      customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
      customer_id: customer?.id || data.customer_id,
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      customer_zip: customer?.postal_code || '',
      
      // Vehicle information
      vehicle_year: vehicle?.year || '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      vehicle: vehicle || undefined,
      
      // Technician information
      technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
    };

    console.log('Fetched work order by ID:', workOrder);
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
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
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
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map((workOrder: any) => {
      const customer = workOrder.customers;
      const vehicle = workOrder.vehicles;
      const technician = workOrder.profiles;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
        customer_id: customer?.id || workOrder.customer_id,
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        
        // Vehicle information
        vehicle_year: vehicle?.year || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        vehicle: vehicle || undefined,
        
        // Technician information
        technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
      };
    });

    console.log('Fetched work orders by customer ID:', workOrders.length);
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
        customers!work_orders_customer_id_fkey (
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
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map((workOrder: any) => {
      const customer = workOrder.customers;
      const vehicle = workOrder.vehicles;
      const technician = workOrder.profiles;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
        customer_id: customer?.id || workOrder.customer_id,
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        
        // Vehicle information
        vehicle_year: vehicle?.year || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        vehicle: vehicle || undefined,
        
        // Technician information
        technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
      };
    });

    console.log('Fetched work orders by status:', workOrders.length);
    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<Array<{ id: string; name: string; email: string }>> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        technician_id,
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching unique technicians:', error);
      throw error;
    }

    // Extract unique technicians
    const techniciansMap = new Map();
    (data || []).forEach((item: any) => {
      const profile = item.profiles;
      if (profile && !techniciansMap.has(profile.id)) {
        techniciansMap.set(profile.id, {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email
        });
      }
    });

    const technicians = Array.from(techniciansMap.values());
    console.log('Fetched unique technicians:', technicians.length);
    return technicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw error;
  }
};

/**
 * Get work orders with pagination
 */
export const getWorkOrdersPaginated = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    technician?: string;
    customer?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ data: WorkOrder[]; total: number; hasMore: boolean }> => {
  try {
    let query = supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
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
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.technician) {
      query = query.eq('technician_id', filters.technician);
    }
    if (filters?.customer) {
      query = query.eq('customer_id', filters.customer);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching paginated work orders:', error);
      throw error;
    }

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = (data || []).map((workOrder: any) => {
      const customer = workOrder.customers;
      const vehicle = workOrder.vehicles;
      const technician = workOrder.profiles;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
        customer_id: customer?.id || workOrder.customer_id,
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        
        // Vehicle information
        vehicle_year: vehicle?.year || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        vehicle: vehicle || undefined,
        
        // Technician information
        technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
      };
    });

    const total = count || 0;
    const hasMore = from + workOrders.length < total;

    console.log(`Fetched paginated work orders: ${workOrders.length} of ${total}`);
    return { data: workOrders, total, hasMore };
  } catch (error) {
    console.error('Error in getWorkOrdersPaginated:', error);
    throw error;
  }
};
