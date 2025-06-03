import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { loadJobLinesFromDatabase } from '@/services/jobLineService';

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders');

    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching work orders:', error);
      throw error;
    }

    console.log(`Fetched ${data.length} work orders`);
    return data as WorkOrder[];
  } catch (error) {
    console.error('Error fetching all work orders:', error);
    return [];
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    console.log('Fetching work order with ID:', id);
    
    const { data: workOrderData, error } = await supabase.rpc('get_work_order_with_details', {
      work_order_id: id
    });

    if (error) {
      console.error('Database error fetching work order:', error);
      throw error;
    }

    if (!workOrderData || workOrderData.length === 0) {
      console.log('No work order found with ID:', id);
      return null;
    }

    const workOrder = workOrderData[0];
    console.log('Raw work order data:', workOrder);

    // Enrich the work order with related data
    const enrichedWorkOrder = await enrichWorkOrderWithRelatedData(workOrder);
    console.log('Enriched work order:', enrichedWorkOrder);

    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error fetching work order by ID:', error);
    throw error;
  }
}

async function enrichWorkOrderWithRelatedData(workOrder: any): Promise<WorkOrder> {
  try {
    console.log('Enriching work order with related data:', workOrder.id);

    // Fetch time entries
    const { data: timeEntries } = await supabase.rpc('get_work_order_time_entries', {
      work_order_id: workOrder.id
    });

    // Fetch inventory items
    const { data: inventoryData } = await supabase.rpc('get_work_order_inventory_items', {
      work_order_id: workOrder.id
    });

    // Map inventory items and calculate total
    const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price // Calculate total here
    }));

    // Fetch job lines
    const jobLines: WorkOrderJobLine[] = await loadJobLinesFromDatabase(workOrder.id);

    // Build the enriched work order
    const enrichedWorkOrder: WorkOrder = {
      id: workOrder.id,
      customer_id: workOrder.customer_id,
      vehicle_id: workOrder.vehicle_id,
      advisor_id: workOrder.advisor_id,
      technician_id: workOrder.technician_id,
      estimated_hours: workOrder.estimated_hours,
      total_cost: workOrder.total_cost,
      created_by: workOrder.created_by,
      created_at: workOrder.created_at,
      updated_at: workOrder.updated_at,
      start_time: workOrder.start_time,
      end_time: workOrder.end_time,
      service_category_id: workOrder.service_category_id,
      invoiced_at: workOrder.invoiced_at,
      status: workOrder.status,
      description: workOrder.description,
      service_type: workOrder.service_type,
      invoice_id: workOrder.invoice_id,
      work_order_number: workOrder.work_order_number,
      
      // Customer information
      customer_name: workOrder.customer_first_name && workOrder.customer_last_name 
        ? `${workOrder.customer_first_name} ${workOrder.customer_last_name}` 
        : null,
      customer_email: workOrder.customer_email,
      customer_phone: workOrder.customer_phone,
      
      // Vehicle information
      vehicle_year: workOrder.vehicle_year,
      vehicle_make: workOrder.vehicle_make,
      vehicle_model: workOrder.vehicle_model,
      vehicle_vin: workOrder.vehicle_vin,
      vehicle_license_plate: workOrder.vehicle_license_plate,
      
      // Related data
      timeEntries: timeEntries || [],
      inventoryItems,
      jobLines
    };

    console.log('Work order enriched with related data:', enrichedWorkOrder);
    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error enriching work order with related data:', error);
    throw error;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    console.log(`Fetching work orders for customer ID: ${customerId}`);

    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Database error fetching work orders for customer ID ${customerId}:`, error);
      throw error;
    }

    console.log(`Fetched ${data.length} work orders for customer ID: ${customerId}`);
    return data as WorkOrder[];
  } catch (error) {
    console.error(`Error fetching work orders for customer ID ${customerId}:`, error);
    return [];
  }
}

export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
    try {
      console.log(`Fetching work orders with status: ${status}`);
  
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error(`Database error fetching work orders with status ${status}:`, error);
        throw error;
      }
  
      console.log(`Fetched ${data.length} work orders with status: ${status}`);
      return data as WorkOrder[];
    } catch (error) {
      console.error(`Error fetching work orders with status ${status}:`, error);
      return [];
    }
  }

  export async function getUniqueTechnicians(): Promise<string[]> {
    try {
      console.log('Fetching unique technicians');
  
      const { data, error } = await supabase
        .from('work_orders')
        .select('technician')
        .not('technician', 'is', null)
        .order('technician', { ascending: true });
  
      if (error) {
        console.error('Database error fetching unique technicians:', error);
        throw error;
      }
  
      // Extract technician names and filter out any potential null or empty values
      const technicians = [...new Set(data.map(item => item.technician).filter(Boolean))] as string[];
      console.log(`Fetched ${technicians.length} unique technicians`);
      return technicians;
    } catch (error) {
      console.error('Error fetching unique technicians:', error);
      return [];
    }
  }
