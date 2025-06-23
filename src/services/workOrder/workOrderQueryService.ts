
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { mapFromDbWorkOrder } from '@/utils/databaseMappers';

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    console.log('Raw work orders data:', data);

    const workOrders = data?.map((workOrder: any) => {
      // Extract customer information
      const customer = workOrder.customers;
      const customerName = customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        : null;

      // Create enhanced work order object
      const enhancedWorkOrder = {
        ...workOrder,
        customer_name: customerName || 'Unknown Customer',
        customer_first_name: customer?.first_name || null,
        customer_last_name: customer?.last_name || null,
        customer_email: customer?.email || null,
        customer_phone: customer?.phone || null
      };

      console.log('Processed work order:', {
        id: workOrder.id,
        original_customer: workOrder.customers,
        enhanced_customer_name: enhancedWorkOrder.customer_name
      });

      return mapFromDbWorkOrder(enhancedWorkOrder);
    }) || [];

    console.log('Processed work orders:', workOrders.length);
    return workOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    console.log('Fetching work order by ID:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    console.log('Raw work order data:', data);

    // Extract customer information
    const customer = data.customers;
    const customerName = customer 
      ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
      : null;

    // Create enhanced work order object
    const enhancedWorkOrder = {
      ...data,
      customer_name: customerName || 'Unknown Customer',
      customer_first_name: customer?.first_name || null,
      customer_last_name: customer?.last_name || null,
      customer_email: customer?.email || null,
      customer_phone: customer?.phone || null
    };

    console.log('Processed work order:', {
      id: data.id,
      original_customer: data.customers,
      enhanced_customer_name: enhancedWorkOrder.customer_name
    });

    return mapFromDbWorkOrder(enhancedWorkOrder);
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders by customer ID:', customerId);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    const workOrders = data?.map((workOrder: any) => {
      // Extract customer information
      const customer = workOrder.customers;
      const customerName = customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        : null;

      // Create enhanced work order object
      const enhancedWorkOrder = {
        ...workOrder,
        customer_name: customerName || 'Unknown Customer',
        customer_first_name: customer?.first_name || null,
        customer_last_name: customer?.last_name || null,
        customer_email: customer?.email || null,
        customer_phone: customer?.phone || null
      };

      return mapFromDbWorkOrder(enhancedWorkOrder);
    }) || [];

    console.log('Processed work orders for customer:', workOrders.length);
    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
}

// Add missing exports that are referenced in the index file
export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const workOrders = data?.map((workOrder: any) => {
      const customer = workOrder.customers;
      const customerName = customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        : null;

      const enhancedWorkOrder = {
        ...workOrder,
        customer_name: customerName || 'Unknown Customer',
        customer_first_name: customer?.first_name || null,
        customer_last_name: customer?.last_name || null,
        customer_email: customer?.email || null,
        customer_phone: customer?.phone || null
      };

      return mapFromDbWorkOrder(enhancedWorkOrder);
    }) || [];

    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
}

export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician')
      .not('technician', 'is', null);

    if (error) {
      throw error;
    }

    const technicians = Array.from(new Set(data?.map(item => item.technician).filter(Boolean))) as string[];
    return technicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw error;
  }
}

export async function getWorkOrderTimeEntries(workOrderId: string) {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderTimeEntries:', error);
    throw error;
  }
}
