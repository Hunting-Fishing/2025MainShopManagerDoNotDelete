import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  console.log('Fetching all work orders...');

  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    console.log('Work orders data:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder> => {
  console.log('Fetching work order by ID:', id);
  
  try {
    // First get the work order
    const { data: workOrderData, error: workOrderError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (workOrderError) {
      console.error('Error fetching work order:', workOrderError);
      throw new Error(`Failed to fetch work order: ${workOrderError.message}`);
    }

    if (!workOrderData) {
      throw new Error('Work order not found');
    }

    console.log('Work order data:', workOrderData);

    // Get customer data separately if customer_id exists
    let customerData = null;
    if (workOrderData.customer_id) {
      const { data, error } = await supabase
        .from('customers')
        .select('first_name, last_name, email, phone')
        .eq('id', workOrderData.customer_id)
        .single();
      
      if (!error && data) {
        customerData = data;
        console.log('Customer data:', customerData);
      }
    }

    // Map the work order with customer details
    const workOrder: WorkOrder = {
      ...workOrderData,
      customer_first_name: customerData?.first_name || null,
      customer_last_name: customerData?.last_name || null,
      customer_email: customerData?.email || null,
      customer_phone: customerData?.phone || null,
    };

    console.log('Final work order with customer data:', workOrder);
    return workOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  console.log('Fetching work orders by customer ID:', customerId);
  
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    console.log('Work orders data:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  console.log('Fetching work orders by status:', status);
  
  try {
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (workOrdersError) {
      console.error('Error fetching work orders by status:', workOrdersError);
      throw new Error(`Failed to fetch work orders: ${workOrdersError.message}`);
    }

    // Get customer data for each work order
    const workOrdersWithCustomers = await Promise.all(
      (workOrdersData || []).map(async (workOrder) => {
        let customerData = null;
        if (workOrder.customer_id) {
          const { data, error } = await supabase
            .from('customers')
            .select('first_name, last_name, email, phone')
            .eq('id', workOrder.customer_id)
            .single();
          
          if (!error && data) {
            customerData = data;
          }
        }

        return {
          ...workOrder,
          customer_first_name: customerData?.first_name || null,
          customer_last_name: customerData?.last_name || null,
          customer_email: customerData?.email || null,
          customer_phone: customerData?.phone || null,
        };
      })
    );

    console.log('Work orders with customer data:', workOrdersWithCustomers);
    return workOrdersWithCustomers;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw new Error(`Failed to fetch technicians: ${error.message}`);
    }

    // Extract unique technician IDs
    const uniqueTechnicians = [...new Set(data?.map(item => item.technician_id).filter(Boolean))] as string[];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw error;
  }
};

export const getWorkOrderTimeEntries = async (workOrderId: string) => {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
      throw new Error(`Failed to fetch time entries: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderTimeEntries:', error);
    throw error;
  }
};
