
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { Database } from '@/types/supabase';

type WorkOrderRow = Database['public']['Tables']['work_orders']['Row'];
type CustomerRow = Database['public']['Tables']['customers']['Row'];

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders with customer information...');
    
    // Fetch work orders and customers separately to avoid relationship ambiguity issues
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (workOrdersError) {
      console.error('Error fetching work orders:', workOrdersError);
      throw new Error(`Failed to fetch work orders: ${workOrdersError.message}`);
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      console.log('No work orders found');
      return [];
    }

    // Get unique customer IDs
    const customerIds = [...new Set(workOrdersData
      .map(wo => wo.customer_id)
      .filter(Boolean))] as string[];

    let customersMap = new Map<string, CustomerRow>();
    
    if (customerIds.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .in('id', customerIds);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
      } else if (customersData) {
        customersData.forEach(customer => {
          customersMap.set(customer.id, customer);
        });
      }
    }

    // Transform and combine the data
    const workOrders: WorkOrder[] = workOrdersData.map((workOrder) => {
      const customer = workOrder.customer_id ? customersMap.get(workOrder.customer_id) : null;
      
      console.log('Processing work order:', workOrder.id, 'Customer:', customer);
      
      return {
        ...workOrder,
        customer_first_name: customer?.first_name || undefined,
        customer_last_name: customer?.last_name || undefined,
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer' : undefined,
        customer_email: customer?.email || undefined,
        customer_phone: customer?.phone || undefined,
      };
    });

    console.log(`Successfully processed ${workOrders.length} work orders`);
    return workOrders;

  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    console.log('Fetching work order by ID:', id);
    
    const { data: workOrderData, error: workOrderError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (workOrderError) {
      if (workOrderError.code === 'PGRST116') {
        return null; // Work order not found
      }
      console.error('Error fetching work order:', workOrderError);
      throw new Error(`Failed to fetch work order: ${workOrderError.message}`);
    }

    if (!workOrderData) {
      return null;
    }

    // Fetch customer data if customer_id exists
    let customer: CustomerRow | null = null;
    if (workOrderData.customer_id) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .eq('id', workOrderData.customer_id)
        .single();
      
      customer = customerData;
    }

    const workOrder: WorkOrder = {
      ...workOrderData,
      customer_first_name: customer?.first_name || undefined,
      customer_last_name: customer?.last_name || undefined,
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer' : undefined,
      customer_email: customer?.email || undefined,
      customer_phone: customer?.phone || undefined,
    };

    return workOrder;

  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders by customer ID:', customerId);
    
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (workOrdersError) {
      console.error('Error fetching work orders by customer ID:', workOrdersError);
      throw new Error(`Failed to fetch work orders: ${workOrdersError.message}`);
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      return [];
    }

    // Get customer data
    const { data: customerData } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone')
      .eq('id', customerId)
      .single();

    const workOrders: WorkOrder[] = workOrdersData.map((workOrder) => ({
      ...workOrder,
      customer_first_name: customerData?.first_name || undefined,
      customer_last_name: customerData?.last_name || undefined,
      customer_name: customerData ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || 'Unnamed Customer' : undefined,
      customer_email: customerData?.email || undefined,
      customer_phone: customerData?.phone || undefined,
    }));

    return workOrders;

  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
}

export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders by status:', status);
    
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (workOrdersError) {
      console.error('Error fetching work orders by status:', workOrdersError);
      throw new Error(`Failed to fetch work orders: ${workOrdersError.message}`);
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      return [];
    }

    // Get unique customer IDs and fetch customer data
    const customerIds = [...new Set(workOrdersData
      .map(wo => wo.customer_id)
      .filter(Boolean))] as string[];

    let customersMap = new Map<string, CustomerRow>();
    
    if (customerIds.length > 0) {
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .in('id', customerIds);

      if (customersData) {
        customersData.forEach(customer => {
          customersMap.set(customer.id, customer);
        });
      }
    }

    const workOrders: WorkOrder[] = workOrdersData.map((workOrder) => {
      const customer = workOrder.customer_id ? customersMap.get(workOrder.customer_id) : null;
      
      return {
        ...workOrder,
        customer_first_name: customer?.first_name || undefined,
        customer_last_name: customer?.last_name || undefined,
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer' : undefined,
        customer_email: customer?.email || undefined,
        customer_phone: customer?.phone || undefined,
      };
    });

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
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching unique technicians:', error);
      throw new Error(`Failed to fetch technicians: ${error.message}`);
    }

    // Extract unique technician IDs
    const uniqueTechnicians = [...new Set(data?.map(wo => wo.technician_id).filter(Boolean))] as string[];
    
    return uniqueTechnicians;
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
      console.error('Error fetching work order time entries:', error);
      throw new Error(`Failed to fetch time entries: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderTimeEntries:', error);
    throw error;
  }
}
