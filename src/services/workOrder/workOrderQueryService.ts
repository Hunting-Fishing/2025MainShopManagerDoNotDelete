
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";

/**
 * Get all work orders with customer, vehicle, and technician information
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers!work_orders_customer_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state
        ),
        vehicle:vehicles!work_orders_vehicle_id_fkey(
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        technician:profiles!work_orders_technician_id_fkey(
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

    console.log('Raw work orders data:', data);

    if (!data) return [];

    // Transform the data to match our WorkOrder interface
    const transformedWorkOrders = data.map((wo: any) => {
      console.log('Processing work order:', wo.id);
      console.log('Customer data:', wo.customer);
      console.log('Vehicle data:', wo.vehicle);
      console.log('Technician data:', wo.technician);

      return {
        ...wo,
        // Handle customer data - could be an object or null
        customer_name: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : undefined,
        customer_email: wo.customer?.email || undefined,
        customer_phone: wo.customer?.phone || undefined,
        customer_address: wo.customer?.address || undefined,
        customer_city: wo.customer?.city || undefined,
        customer_state: wo.customer?.state || undefined,
        
        // Handle vehicle data - could be an object or null
        vehicle: wo.vehicle ? {
          id: wo.vehicle.id,
          year: wo.vehicle.year ? String(wo.vehicle.year) : undefined,
          make: wo.vehicle.make || undefined,
          model: wo.vehicle.model || undefined,
          vin: wo.vehicle.vin || undefined,
          license_plate: wo.vehicle.license_plate || undefined,
        } : undefined,
        vehicle_year: wo.vehicle?.year ? String(wo.vehicle.year) : undefined,
        vehicle_make: wo.vehicle?.make || undefined,
        vehicle_model: wo.vehicle?.model || undefined,
        vehicle_vin: wo.vehicle?.vin || undefined,
        vehicle_license_plate: wo.vehicle?.license_plate || undefined,
        
        // Handle technician name
        technician: wo.technician ? `${wo.technician.first_name || ''} ${wo.technician.last_name || ''}`.trim() : undefined,
      };
    });

    console.log('Transformed work orders:', transformedWorkOrders);
    return transformedWorkOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get a specific work order by ID with all related data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers!work_orders_customer_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state
        ),
        vehicle:vehicles!work_orders_vehicle_id_fkey(
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        technician:profiles!work_orders_technician_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) return null;

    console.log('Raw work order data:', data);

    // Fetch related data in parallel
    const [jobLinesResult, inventoryResult, timeEntriesResult] = await Promise.all([
      supabase
        .from('work_order_job_lines')
        .select('*')
        .eq('work_order_id', id)
        .order('display_order', { ascending: true }),
      
      supabase
        .from('work_order_inventory_items')
        .select('*')
        .eq('work_order_id', id),
      
      supabase
        .from('work_order_time_entries')
        .select('*')
        .eq('work_order_id', id)
        .order('created_at', { ascending: false })
    ]);

    // Transform the work order data
    const workOrder: WorkOrder = {
      ...data,
      // Handle customer data
      customer_name: data.customer ? `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim() : undefined,
      customer_email: data.customer?.email || undefined,
      customer_phone: data.customer?.phone || undefined,
      customer_address: data.customer?.address || undefined,
      customer_city: data.customer?.city || undefined,
      customer_state: data.customer?.state || undefined,
      
      // Handle vehicle data
      vehicle: data.vehicle ? {
        id: data.vehicle.id,
        year: data.vehicle.year ? String(data.vehicle.year) : undefined,
        make: data.vehicle.make || undefined,
        model: data.vehicle.model || undefined,
        vin: data.vehicle.vin || undefined,
        license_plate: data.vehicle.license_plate || undefined,
      } : undefined,
      vehicle_year: data.vehicle?.year ? String(data.vehicle.year) : undefined,
      vehicle_make: data.vehicle?.make || undefined,
      vehicle_model: data.vehicle?.model || undefined,
      vehicle_vin: data.vehicle?.vin || undefined,
      vehicle_license_plate: data.vehicle?.license_plate || undefined,
      
      // Handle technician name
      technician: data.technician ? `${data.technician.first_name || ''} ${data.technician.last_name || ''}`.trim() : undefined,
      
      // Add related data
      jobLines: jobLinesResult.data?.map((jl: any) => ({
        ...jl,
        createdAt: jl.created_at,
        updatedAt: jl.updated_at
      } as WorkOrderJobLine)) || [],
      
      inventoryItems: inventoryResult.data?.map((item: any) => ({
        ...item,
        total: (item.quantity || 0) * (item.unit_price || 0)
      } as WorkOrderInventoryItem)) || [],
      
      inventory_items: inventoryResult.data?.map((item: any) => ({
        ...item,
        total: (item.quantity || 0) * (item.unit_price || 0)
      } as WorkOrderInventoryItem)) || [],
      
      timeEntries: timeEntriesResult.data?.map((entry: any) => ({
        ...entry,
        work_order_id: entry.work_order_id || id
      } as TimeEntry)) || [],
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
        customer:customers!work_orders_customer_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        vehicle:vehicles!work_orders_vehicle_id_fkey(
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        technician:profiles!work_orders_technician_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer work orders:', error);
      throw error;
    }

    if (!data) return [];

    // Transform the data
    return data.map((wo: any) => ({
      ...wo,
      customer_name: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : undefined,
      customer_email: wo.customer?.email || undefined,
      vehicle_year: wo.vehicle?.year ? String(wo.vehicle.year) : undefined,
      vehicle_make: wo.vehicle?.make || undefined,
      vehicle_model: wo.vehicle?.model || undefined,
      vehicle_vin: wo.vehicle?.vin || undefined,
      vehicle_license_plate: wo.vehicle?.license_plate || undefined,
      technician: wo.technician ? `${wo.technician.first_name || ''} ${wo.technician.last_name || ''}`.trim() : undefined,
    }));
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
        customer:customers!work_orders_customer_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        vehicle:vehicles!work_orders_vehicle_id_fkey(
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        technician:profiles!work_orders_technician_id_fkey(
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

    if (!data) return [];

    // Transform the data
    return data.map((wo: any) => ({
      ...wo,
      customer_name: wo.customer ? `${wo.customer.first_name || ''} ${wo.customer.last_name || ''}`.trim() : undefined,
      customer_email: wo.customer?.email || undefined,
      vehicle_year: wo.vehicle?.year ? String(wo.vehicle.year) : undefined,
      vehicle_make: wo.vehicle?.make || undefined,
      vehicle_model: wo.vehicle?.model || undefined,
      vehicle_vin: wo.vehicle?.vin || undefined,
      vehicle_license_plate: wo.vehicle?.license_plate || undefined,
      technician: wo.technician ? `${wo.technician.first_name || ''} ${wo.technician.last_name || ''}`.trim() : undefined,
    }));
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<Array<{id: string; name: string}>> => {
  try {
    console.log('Fetching unique technicians...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .not('first_name', 'is', null)
      .not('last_name', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    if (!data) return [];

    // Transform to the expected format
    return data.map((profile: any) => ({
      id: profile.id,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    })).filter(tech => tech.name.length > 0);
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};
