
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { normalizeWorkOrder } from '@/utils/workOrders';

// Enhanced function to enrich work order with all related data including job lines
export const enrichWorkOrderWithRelatedData = async (workOrder: any): Promise<WorkOrder> => {
  console.log('Enriching work order with related data:', workOrder.id);
  
  try {
    // Fetch time entries
    const { data: timeEntries, error: timeError } = await supabase.rpc('get_work_order_time_entries', {
      work_order_id: workOrder.id
    });

    if (timeError) {
      console.error('Error fetching time entries:', timeError);
    }

    // Fetch inventory items
    const { data: inventoryItems, error: inventoryError } = await supabase.rpc('get_work_order_inventory_items', {
      work_order_id: workOrder.id
    });

    if (inventoryError) {
      console.error('Error fetching inventory items:', inventoryError);
    }

    // Fetch job lines
    const { data: jobLinesData, error: jobLinesError } = await supabase.rpc('get_work_order_job_lines', {
      work_order_id_param: workOrder.id
    });

    if (jobLinesError) {
      console.error('Error fetching job lines:', jobLinesError);
    }

    // Map job lines to proper format
    const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map((item: any): WorkOrderJobLine => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      description: item.description,
      estimatedHours: item.estimated_hours,
      laborRate: item.labor_rate,
      totalAmount: item.total_amount,
      status: item.status as WorkOrderJobLine['status'],
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    console.log(`Fetched ${jobLines.length} job lines for work order ${workOrder.id}`);

    // Create enriched work order with all related data
    const enrichedWorkOrder: WorkOrder = {
      ...normalizeWorkOrder(workOrder),
      timeEntries: timeEntries || [],
      inventoryItems: inventoryItems || [],
      jobLines: jobLines
    };

    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error enriching work order data:', error);
    // Return basic work order if enrichment fails
    return {
      ...normalizeWorkOrder(workOrder),
      timeEntries: [],
      inventoryItems: [],
      jobLines: []
    };
  }
};

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('No work orders found');
      return [];
    }

    // Enrich each work order with related data including job lines
    const enrichedWorkOrders = await Promise.all(
      data.map(async (workOrder) => {
        return enrichWorkOrderWithRelatedData(workOrder);
      })
    );

    console.log(`Retrieved ${enrichedWorkOrders.length} work orders with full data`);
    return enrichedWorkOrders;

  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw new Error('Failed to fetch work orders');
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);

    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('Work order not found:', id);
      return null;
    }

    console.log('Found work order, enriching with related data...');
    
    // Enrich with all related data including job lines
    const enrichedWorkOrder = await enrichWorkOrderWithRelatedData(data);
    
    console.log('Work order enriched successfully with job lines:', enrichedWorkOrder.jobLines?.length || 0);
    return enrichedWorkOrder;

  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw new Error(`Failed to fetch work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Enrich each work order with related data including job lines
    const enrichedWorkOrders = await Promise.all(
      data.map(async (workOrder) => {
        return enrichWorkOrderWithRelatedData(workOrder);
      })
    );

    return enrichedWorkOrders;

  } catch (error) {
    console.error('Error fetching work orders by customer:', error);
    throw new Error('Failed to fetch customer work orders');
  }
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Enrich each work order with related data including job lines
    const enrichedWorkOrders = await Promise.all(
      data.map(async (workOrder) => {
        return enrichWorkOrderWithRelatedData(workOrder);
      })
    );

    return enrichedWorkOrders;

  } catch (error) {
    console.error('Error fetching work orders by status:', error);
    throw new Error('Failed to fetch work orders by status');
  }
};

export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) throw error;

    const uniqueTechnicians = [...new Set(data?.map(item => item.technician_id).filter(Boolean))];
    return uniqueTechnicians;

  } catch (error) {
    console.error('Error fetching unique technicians:', error);
    return [];
  }
};
