
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { mapFromDbWorkOrder } from '@/utils/databaseMappers';

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  console.log('🔄 getAllWorkOrders: Starting fetch from database...');
  
  try {
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
      console.warn('⚠️ No authenticated user found');
      return [];
    }

    // Fetch work orders with customer information joined
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
      console.error('❌ getAllWorkOrders error:', error);
      throw error;
    }

    console.log('✅ getAllWorkOrders: Fetched', data?.length || 0, 'work orders from database');
    console.log('📊 getAllWorkOrders: Sample data with customer info:', data?.slice(0, 2));
    
    // Transform the data to include customer name
    const workOrders = (data || []).map(workOrder => {
      const customer = workOrder.customers;
      let customer_name = '';
      
      if (customer) {
        if (customer.first_name && customer.last_name) {
          customer_name = `${customer.first_name} ${customer.last_name}`;
        } else if (customer.first_name) {
          customer_name = customer.first_name;
        } else if (customer.last_name) {
          customer_name = customer.last_name;
        }
      }
      
      return {
        ...workOrder,
        customer_name,
        customer: customer || null
      };
    });
    
    return workOrders;
  } catch (error) {
    console.error('❌ getAllWorkOrders: Exception caught:', error);
    throw error;
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  console.log('🔍 getWorkOrderById: Fetching work order with id:', id);
  
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
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('❌ getWorkOrderById error:', error);
      throw error;
    }

    if (!data) {
      console.log('⚠️ getWorkOrderById: No work order found with id:', id);
      return null;
    }

    console.log('✅ getWorkOrderById: Found work order:', data);
    
    // Transform the data to include customer name
    const customer = data.customers;
    let customer_name = '';
    
    if (customer) {
      if (customer.first_name && customer.last_name) {
        customer_name = `${customer.first_name} ${customer.last_name}`;
      } else if (customer.first_name) {
        customer_name = customer.first_name;
      } else if (customer.last_name) {
        customer_name = customer.last_name;
      }
    }
    
    return {
      ...data,
      customer_name,
      customer: customer || null
    };
  } catch (error) {
    console.error('❌ getWorkOrderById: Exception caught:', error);
    throw error;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  console.log('🔍 getWorkOrdersByCustomerId: Fetching work orders for customer:', customerId);
  
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
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ getWorkOrdersByCustomerId error:', error);
      throw error;
    }

    console.log('✅ getWorkOrdersByCustomerId: Found', data?.length || 0, 'work orders');
    
    // Transform the data to include customer name
    const workOrders = (data || []).map(workOrder => {
      const customer = workOrder.customers;
      let customer_name = '';
      
      if (customer) {
        if (customer.first_name && customer.last_name) {
          customer_name = `${customer.first_name} ${customer.last_name}`;
        } else if (customer.first_name) {
          customer_name = customer.first_name;
        } else if (customer.last_name) {
          customer_name = customer.last_name;
        }
      }
      
      return {
        ...workOrder,
        customer_name,
        customer: customer || null
      };
    });
    
    return workOrders;
  } catch (error) {
    console.error('❌ getWorkOrdersByCustomerId: Exception caught:', error);
    throw error;
  }
}
