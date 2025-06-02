
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";

/**
 * Get all work orders with customer and vehicle details using explicit JOINs
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders with explicit JOINs');
    
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
          state,
          postal_code
        ),
        vehicle:vehicles!work_orders_vehicle_id_fkey(
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

    console.log(`Fetched ${data?.length || 0} work orders`);

    // Map the data to include flattened customer and vehicle info
    const workOrders: WorkOrder[] = (data || []).map((workOrder: any) => ({
      ...workOrder,
      customer_name: workOrder.customer ? `${workOrder.customer.first_name || ''} ${workOrder.customer.last_name || ''}`.trim() : '',
      customer_email: workOrder.customer?.email || '',
      customer_phone: workOrder.customer?.phone || '',
      customer_address: workOrder.customer?.address || '',
      customer_city: workOrder.customer?.city || '',
      customer_state: workOrder.customer?.state || '',
      customer_zip: workOrder.customer?.postal_code || '',
      vehicle_year: workOrder.vehicle?.year?.toString() || '',
      vehicle_make: workOrder.vehicle?.make || '',
      vehicle_model: workOrder.vehicle?.model || '',
      vehicle_vin: workOrder.vehicle?.vin || '',
      vehicle_license_plate: workOrder.vehicle?.license_plate || '',
      // Preserve the original objects for compatibility
      customer: workOrder.customer,
      vehicle: workOrder.vehicle
    }));

    return workOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get a single work order by ID with all related data
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
          state,
          postal_code
        ),
        vehicle:vehicles!work_orders_vehicle_id_fkey(
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
      console.warn('Work order not found:', id);
      return null;
    }

    console.log('Work order fetched successfully:', data);

    // Map the data to include flattened customer and vehicle info
    const workOrder: WorkOrder = {
      ...data,
      customer_name: data.customer ? `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim() : '',
      customer_email: data.customer?.email || '',
      customer_phone: data.customer?.phone || '',
      customer_address: data.customer?.address || '',
      customer_city: data.customer?.city || '',
      customer_state: data.customer?.state || '',
      customer_zip: data.customer?.postal_code || '',
      vehicle_year: data.vehicle?.year?.toString() || '',
      vehicle_make: data.vehicle?.make || '',
      vehicle_model: data.vehicle?.model || '',
      vehicle_vin: data.vehicle?.vin || '',
      vehicle_license_plate: data.vehicle?.license_plate || '',
      // Preserve the original objects for compatibility
      customer: data.customer,
      vehicle: data.vehicle
    };

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
          email,
          phone,
          address,
          city,
          state,
          postal_code
        ),
        vehicle:vehicles!work_orders_vehicle_id_fkey(
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
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} work orders for customer ${customerId}`);

    // Map the data to include flattened customer and vehicle info
    const workOrders: WorkOrder[] = (data || []).map((workOrder: any) => ({
      ...workOrder,
      customer_name: workOrder.customer ? `${workOrder.customer.first_name || ''} ${workOrder.customer.last_name || ''}`.trim() : '',
      customer_email: workOrder.customer?.email || '',
      customer_phone: workOrder.customer?.phone || '',
      customer_address: workOrder.customer?.address || '',
      customer_city: workOrder.customer?.city || '',
      customer_state: workOrder.customer?.state || '',
      customer_zip: workOrder.customer?.postal_code || '',
      vehicle_year: workOrder.vehicle?.year?.toString() || '',
      vehicle_make: workOrder.vehicle?.make || '',
      vehicle_model: workOrder.vehicle?.model || '',
      vehicle_vin: workOrder.vehicle?.vin || '',
      vehicle_license_plate: workOrder.vehicle?.license_plate || '',
      // Preserve the original objects for compatibility
      customer: workOrder.customer,
      vehicle: workOrder.vehicle
    }));

    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    return [];
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
          email,
          phone,
          address,
          city,
          state,
          postal_code
        ),
        vehicle:vehicles!work_orders_vehicle_id_fkey(
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

    console.log(`Fetched ${data?.length || 0} work orders with status ${status}`);

    // Map the data to include flattened customer and vehicle info
    const workOrders: WorkOrder[] = (data || []).map((workOrder: any) => ({
      ...workOrder,
      customer_name: workOrder.customer ? `${workOrder.customer.first_name || ''} ${workOrder.customer.last_name || ''}`.trim() : '',
      customer_email: workOrder.customer?.email || '',
      customer_phone: workOrder.customer?.phone || '',
      customer_address: workOrder.customer?.address || '',
      customer_city: workOrder.customer?.city || '',
      customer_state: workOrder.customer?.state || '',
      customer_zip: workOrder.customer?.postal_code || '',
      vehicle_year: workOrder.vehicle?.year?.toString() || '',
      vehicle_make: workOrder.vehicle?.make || '',
      vehicle_model: workOrder.vehicle?.model || '',
      vehicle_vin: workOrder.vehicle?.vin || '',
      vehicle_license_plate: workOrder.vehicle?.license_plate || '',
      // Preserve the original objects for compatibility
      customer: workOrder.customer,
      vehicle: workOrder.vehicle
    }));

    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
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
      console.error('Error fetching unique technicians:', error);
      throw error;
    }

    const uniqueTechnicians = [...new Set(data.map(item => item.technician_id).filter(Boolean))];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};
