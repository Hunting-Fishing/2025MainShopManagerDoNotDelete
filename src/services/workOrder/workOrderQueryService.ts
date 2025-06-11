import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';

/**
 * Get all work orders
 */
export async function getAllWorkOrders(): Promise<WorkOrder[]> {
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
          company_name
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          make,
          model,
          year,
          vin,
          license_plate,
          color
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    return data?.map(normalizeWorkOrder) || [];
  } catch (error) {
    console.error('Exception in getAllWorkOrders:', error);
    throw error;
  }
}

/**
 * Get work order by ID
 */
export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
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
          company_name
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          make,
          model,
          year,
          vin,
          license_plate,
          color
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching work order by ID:', error);
      throw error;
    }

    return data ? normalizeWorkOrder(data) : null;
  } catch (error) {
    console.error('Exception in getWorkOrderById:', error);
    throw error;
  }
}

/**
 * Get work orders by customer ID
 */
export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
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
          company_name
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          make,
          model,
          year,
          vin,
          license_plate,
          color
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }

    return data?.map(normalizeWorkOrder) || [];
  } catch (error) {
    console.error('Exception in getWorkOrdersByCustomerId:', error);
    throw error;
  }
}

/**
 * Get work orders by status
 */
export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
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
          company_name
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          make,
          model,
          year,
          vin,
          license_plate,
          color
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    return data?.map(normalizeWorkOrder) || [];
  } catch (error) {
    console.error('Exception in getWorkOrdersByStatus:', error);
    throw error;
  }
}

/**
 * Get unique technicians from work orders
 */
export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_name')
      .not('technician_name', 'is', null);

    if (error) {
      console.error('Error fetching unique technicians:', error);
      throw error;
    }

    const uniqueTechnicians = [...new Set(data?.map(item => item.technician_name).filter(Boolean))];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Exception in getUniqueTechnicians:', error);
    throw error;
  }
}

/**
 * Get time entries for a work order
 */
export async function getWorkOrderTimeEntries(workOrderId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching work order time entries:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception in getWorkOrderTimeEntries:', error);
    throw error;
  }
}

// Helper function to normalize work order data
function normalizeWorkOrder(workOrder: any): WorkOrder {
  return {
    ...workOrder,
    customer_name: workOrder.customers 
      ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
      : null,
    customer_email: workOrder.customers?.email || null,
    customer_phone: workOrder.customers?.phone || null,
    customer_company: workOrder.customers?.company_name || null,
    vehicle_info: workOrder.vehicles 
      ? `${workOrder.vehicles.year || ''} ${workOrder.vehicles.make || ''} ${workOrder.vehicles.model || ''}`.trim()
      : null,
    vehicle_vin: workOrder.vehicles?.vin || null,
    vehicle_license_plate: workOrder.vehicles?.license_plate || null,
    vehicle_color: workOrder.vehicles?.color || null
  };
}
