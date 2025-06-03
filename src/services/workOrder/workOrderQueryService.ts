
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        profiles!work_orders_technician_id_fkey (
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

    console.log(`Found ${data?.length || 0} work orders`);

    // Enrich each work order with related data
    const enrichedWorkOrders = await Promise.all(
      (data || []).map(async (workOrder) => {
        return await enrichWorkOrderWithRelatedData(workOrder);
      })
    );

    return enrichedWorkOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw new Error('Failed to fetch work orders');
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder> {
  try {
    console.log('Fetching work order by ID:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        profiles!work_orders_technician_id_fkey (
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

    if (!data) {
      throw new Error('Work order not found');
    }

    console.log('Work order found, enriching with related data...');
    return await enrichWorkOrderWithRelatedData(data);
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw new Error('Failed to fetch work order');
  }
}

async function enrichWorkOrderWithRelatedData(workOrder: any): Promise<WorkOrder> {
  try {
    console.log('Enriching work order with related data:', workOrder.id);

    // Fetch inventory items
    const { data: inventoryData, error: inventoryError } = await supabase
      .rpc('get_work_order_inventory_items', { work_order_id: workOrder.id });

    if (inventoryError) {
      console.error('Error fetching inventory items:', inventoryError);
    }

    const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map((item: any) => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price, // Calculate total
    }));

    // Fetch time entries
    const { data: timeData, error: timeError } = await supabase
      .rpc('get_work_order_time_entries', { work_order_id: workOrder.id });

    if (timeError) {
      console.error('Error fetching time entries:', timeError);
    }

    const timeEntries: TimeEntry[] = (timeData || []).map((entry: any) => ({
      id: entry.id,
      work_order_id: entry.work_order_id,
      employee_id: entry.employee_id,
      employee_name: entry.employee_name,
      start_time: entry.start_time,
      end_time: entry.end_time,
      duration: entry.duration,
      billable: entry.billable,
      notes: entry.notes,
      created_at: entry.created_at,
    }));

    // Fetch job lines
    const { data: jobLinesData, error: jobLinesError } = await supabase
      .rpc('get_work_order_job_lines', { work_order_id_param: workOrder.id });

    if (jobLinesError) {
      console.error('Error fetching job lines:', jobLinesError);
    }

    const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map((jobLine: any) => ({
      id: jobLine.id,
      workOrderId: jobLine.work_order_id,
      name: jobLine.name,
      category: jobLine.category,
      subcategory: jobLine.subcategory,
      description: jobLine.description,
      estimatedHours: jobLine.estimated_hours,
      laborRate: jobLine.labor_rate,
      totalAmount: jobLine.total_amount,
      status: jobLine.status as WorkOrderJobLine['status'],
      notes: jobLine.notes,
      createdAt: jobLine.created_at,
      updatedAt: jobLine.updated_at,
    }));

    console.log(`Enriched work order with ${inventoryItems.length} inventory items, ${timeEntries.length} time entries, and ${jobLines.length} job lines`);

    // Build customer name
    const customerName = workOrder.customers 
      ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
      : '';

    // Build technician name
    const technicianName = workOrder.profiles
      ? `${workOrder.profiles.first_name || ''} ${workOrder.profiles.last_name || ''}`.trim()
      : '';

    // Create enriched work order
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

      // Computed fields for backward compatibility
      customer: customerName,
      technician: technicianName,
      date: workOrder.created_at,
      dueDate: workOrder.end_time,
      due_date: workOrder.end_time,
      priority: 'medium', // Default priority
      location: '', // Default location
      notes: workOrder.description || '',

      // Customer information
      customer_name: customerName,
      customer_email: workOrder.customers?.email,
      customer_phone: workOrder.customers?.phone,

      // Vehicle information
      vehicle_year: workOrder.vehicles?.year?.toString(),
      vehicle_make: workOrder.vehicles?.make,
      vehicle_model: workOrder.vehicles?.model,
      vehicle_vin: workOrder.vehicles?.vin,
      vehicle_license_plate: workOrder.vehicles?.license_plate,

      // Vehicle object for structured access
      vehicle: workOrder.vehicles ? {
        id: workOrder.vehicles.id,
        year: workOrder.vehicles.year,
        make: workOrder.vehicles.make,
        model: workOrder.vehicles.model,
        vin: workOrder.vehicles.vin,
        license_plate: workOrder.vehicles.license_plate,
      } : undefined,

      // Related data
      timeEntries,
      inventoryItems,
      inventory_items: inventoryItems,
      jobLines,
    };

    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error enriching work order data:', error);
    // Return a basic work order structure if enrichment fails
    return {
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
      customer: '',
      technician: '',
      date: workOrder.created_at,
      dueDate: workOrder.end_time,
      due_date: workOrder.end_time,
      priority: 'medium',
      location: '',
      notes: workOrder.description || '',
      timeEntries: [],
      inventoryItems: [],
      inventory_items: [],
      jobLines: [],
    } as WorkOrder;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders for customer:', customerId);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} work orders for customer`);

    // Enrich each work order with related data
    const enrichedWorkOrders = await Promise.all(
      (data || []).map(async (workOrder) => {
        return await enrichWorkOrderWithRelatedData(workOrder);
      })
    );

    return enrichedWorkOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw new Error('Failed to fetch work orders by customer');
  }
}

export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders by status:', status);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} work orders with status: ${status}`);

    // Enrich each work order with related data
    const enrichedWorkOrders = await Promise.all(
      (data || []).map(async (workOrder) => {
        return await enrichWorkOrderWithRelatedData(workOrder);
      })
    );

    return enrichedWorkOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw new Error('Failed to fetch work orders by status');
  }
}

export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    console.log('Fetching unique technicians...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        profiles!work_orders_technician_id_fkey (
          first_name,
          last_name
        )
      `)
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    // Extract unique technician names
    const technicians = new Set<string>();
    
    (data || []).forEach((workOrder: any) => {
      if (workOrder.profiles) {
        const name = `${workOrder.profiles.first_name || ''} ${workOrder.profiles.last_name || ''}`.trim();
        if (name) {
          technicians.add(name);
        }
      }
    });

    const uniqueTechnicians = Array.from(technicians);
    console.log(`Found ${uniqueTechnicians.length} unique technicians`);
    
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
}
