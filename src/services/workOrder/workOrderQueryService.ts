
import { supabase } from '@/integrations/supabase/client';

export async function getAllWorkOrders() {
  console.log('Fetching all work orders...');
  
  try {
    // First check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
      console.warn('No authenticated user found');
      return [];
    }

    console.log('Authenticated user:', user.id);

    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    console.log('Work orders fetched successfully:', workOrders?.length || 0);
    return workOrders || [];

  } catch (error) {
    console.error('Exception in getAllWorkOrders:', error);
    throw error;
  }
}

export async function getWorkOrderById(workOrderId: string) {
  console.log('Fetching work order by ID:', workOrderId);
  
  try {
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', workOrderId)
      .single();

    if (error) {
      console.error('Error fetching work order:', error);
      throw new Error(`Failed to fetch work order: ${error.message}`);
    }

    console.log('Work order fetched successfully:', workOrder);
    return workOrder;

  } catch (error) {
    console.error('Exception in getWorkOrderById:', error);
    throw error;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string) {
  console.log('Fetching work orders for customer:', customerId);
  
  try {
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer work orders:', error);
      throw new Error(`Failed to fetch customer work orders: ${error.message}`);
    }

    console.log('Customer work orders fetched successfully:', workOrders?.length);
    return workOrders || [];

  } catch (error) {
    console.error('Exception in getWorkOrdersByCustomerId:', error);
    throw error;
  }
}

export async function getWorkOrdersByStatus(status: string) {
  console.log('Fetching work orders by status:', status);
  
  try {
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw new Error(`Failed to fetch work orders by status: ${error.message}`);
    }

    console.log('Work orders by status fetched successfully:', workOrders?.length);
    return workOrders || [];

  } catch (error) {
    console.error('Exception in getWorkOrdersByStatus:', error);
    throw error;
  }
}

export async function getUniqueTechnicians() {
  console.log('Fetching unique technicians...');
  
  try {
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw new Error(`Failed to fetch technicians: ${error.message}`);
    }

    // Extract unique technician IDs
    const uniqueTechnicians = [...new Set(workOrders?.map(wo => wo.technician_id).filter(Boolean))];
    
    console.log('Unique technicians fetched successfully:', uniqueTechnicians.length);
    return uniqueTechnicians || [];

  } catch (error) {
    console.error('Exception in getUniqueTechnicians:', error);
    throw error;
  }
}

export async function getWorkOrderTimeEntries(workOrderId: string) {
  console.log('Fetching time entries for work order:', workOrderId);
  
  try {
    const { data: timeEntries, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
      throw new Error(`Failed to fetch time entries: ${error.message}`);
    }

    console.log('Time entries fetched successfully:', timeEntries?.length);
    return timeEntries || [];

  } catch (error) {
    console.error('Exception in getWorkOrderTimeEntries:', error);
    throw error;
  }
}
