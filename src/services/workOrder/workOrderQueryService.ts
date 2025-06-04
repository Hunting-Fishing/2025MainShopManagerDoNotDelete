
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";

/**
 * Get all work orders with joined customer and vehicle data
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders with joins...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          zip
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        technician:profiles!fk_work_orders_technician (
          id,
          first_name,
          last_name,
          email
        ),
        advisor:profiles!fk_work_orders_advisor (
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

    const workOrders = (data || []).map((workOrder: any): WorkOrder => ({
      id: workOrder.id,
      work_order_number: workOrder.work_order_number,
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
      // Customer data from join
      customer_name: workOrder.customers 
        ? `${workOrder.customers.first_name} ${workOrder.customers.last_name}` 
        : undefined,
      customer_email: workOrder.customers?.email,
      customer_phone: workOrder.customers?.phone,
      customer_address: workOrder.customers?.address,
      customer_city: workOrder.customers?.city,
      customer_state: workOrder.customers?.state,
      customer_zip: workOrder.customers?.zip,
      // Vehicle data from join
      vehicle: workOrder.vehicles ? {
        id: workOrder.vehicles.id,
        year: workOrder.vehicles.year,
        make: workOrder.vehicles.make,
        model: workOrder.vehicles.model,
        vin: workOrder.vehicles.vin,
        license_plate: workOrder.vehicles.license_plate,
        trim: workOrder.vehicles.trim
      } : undefined,
      vehicle_year: workOrder.vehicles?.year?.toString(),
      vehicle_make: workOrder.vehicles?.make,
      vehicle_model: workOrder.vehicles?.model,
      vehicle_vin: workOrder.vehicles?.vin,
      vehicle_license_plate: workOrder.vehicles?.license_plate,
      // Technician name from join
      technician: workOrder.technician 
        ? `${workOrder.technician.first_name} ${workOrder.technician.last_name}` 
        : undefined,
      // Legacy fields for backwards compatibility
      customer: workOrder.customers 
        ? `${workOrder.customers.first_name} ${workOrder.customers.last_name}` 
        : undefined,
      date: workOrder.created_at,
      timeEntries: [],
      inventoryItems: [],
      jobLines: []
    }));

    console.log(`Fetched ${workOrders.length} work orders successfully`);
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
    console.log('Fetching work order by ID with joins:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          zip
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        technician:profiles!fk_work_orders_technician (
          id,
          first_name,
          last_name,
          email
        ),
        advisor:profiles!fk_work_orders_advisor (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('Work order not found:', id);
      return null;
    }

    // Fetch related data
    const [timeEntries, inventoryItems, jobLines] = await Promise.all([
      getWorkOrderTimeEntries(id),
      getWorkOrderInventoryItems(id),
      getWorkOrderJobLines(id)
    ]);

    const workOrder: WorkOrder = {
      id: data.id,
      work_order_number: data.work_order_number,
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      advisor_id: data.advisor_id,
      technician_id: data.technician_id,
      estimated_hours: data.estimated_hours,
      total_cost: data.total_cost,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      start_time: data.start_time,
      end_time: data.end_time,
      service_category_id: data.service_category_id,
      invoiced_at: data.invoiced_at,
      status: data.status,
      description: data.description,
      service_type: data.service_type,
      invoice_id: data.invoice_id,
      // Customer data from join
      customer_name: data.customers 
        ? `${data.customers.first_name} ${data.customers.last_name}` 
        : undefined,
      customer_email: data.customers?.email,
      customer_phone: data.customers?.phone,
      customer_address: data.customers?.address,
      customer_city: data.customers?.city,
      customer_state: data.customers?.state,
      customer_zip: data.customers?.zip,
      // Vehicle data from join
      vehicle: data.vehicles ? {
        id: data.vehicles.id,
        year: data.vehicles.year,
        make: data.vehicles.make,
        model: data.vehicles.model,
        vin: data.vehicles.vin,
        license_plate: data.vehicles.license_plate,
        trim: data.vehicles.trim
      } : undefined,
      vehicle_year: data.vehicles?.year?.toString(),
      vehicle_make: data.vehicles?.make,
      vehicle_model: data.vehicles?.model,
      vehicle_vin: data.vehicles?.vin,
      vehicle_license_plate: data.vehicles?.license_plate,
      // Technician name from join
      technician: data.technician 
        ? `${data.technician.first_name} ${data.technician.last_name}` 
        : undefined,
      // Legacy fields for backwards compatibility
      customer: data.customers 
        ? `${data.customers.first_name} ${data.customers.last_name}` 
        : undefined,
      date: data.created_at,
      timeEntries,
      inventoryItems,
      jobLines
    };

    console.log('Work order fetched successfully:', workOrder.id);
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
        ),
        technician:profiles!fk_work_orders_technician (
          id,
          first_name,
          last_name
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer:', error);
      throw error;
    }

    const workOrders = (data || []).map((workOrder: any): WorkOrder => ({
      id: workOrder.id,
      work_order_number: workOrder.work_order_number,
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
      // Joined data
      customer_name: workOrder.customers 
        ? `${workOrder.customers.first_name} ${workOrder.customers.last_name}` 
        : undefined,
      customer_email: workOrder.customers?.email,
      customer_phone: workOrder.customers?.phone,
      vehicle: workOrder.vehicles ? {
        id: workOrder.vehicles.id,
        year: workOrder.vehicles.year,
        make: workOrder.vehicles.make,
        model: workOrder.vehicles.model,
        vin: workOrder.vehicles.vin,
        license_plate: workOrder.vehicles.license_plate
      } : undefined,
      vehicle_year: workOrder.vehicles?.year?.toString(),
      vehicle_make: workOrder.vehicles?.make,
      vehicle_model: workOrder.vehicles?.model,
      vehicle_vin: workOrder.vehicles?.vin,
      vehicle_license_plate: workOrder.vehicles?.license_plate,
      technician: workOrder.technician 
        ? `${workOrder.technician.first_name} ${workOrder.technician.last_name}` 
        : undefined,
      // Legacy compatibility
      customer: workOrder.customers 
        ? `${workOrder.customers.first_name} ${workOrder.customers.last_name}` 
        : undefined,
      date: workOrder.created_at,
      timeEntries: [],
      inventoryItems: [],
      jobLines: []
    }));

    console.log(`Fetched ${workOrders.length} work orders for customer ${customerId}`);
    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
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
        ),
        technician:profiles!fk_work_orders_technician (
          id,
          first_name,
          last_name
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    const workOrders = (data || []).map((workOrder: any): WorkOrder => ({
      id: workOrder.id,
      work_order_number: workOrder.work_order_number,
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
      // Joined data
      customer_name: workOrder.customers 
        ? `${workOrder.customers.first_name} ${workOrder.customers.last_name}` 
        : undefined,
      customer_email: workOrder.customers?.email,
      customer_phone: workOrder.customers?.phone,
      vehicle: workOrder.vehicles ? {
        id: workOrder.vehicles.id,
        year: workOrder.vehicles.year,
        make: workOrder.vehicles.make,
        model: workOrder.vehicles.model,
        vin: workOrder.vehicles.vin,
        license_plate: workOrder.vehicles.license_plate
      } : undefined,
      vehicle_year: workOrder.vehicles?.year?.toString(),
      vehicle_make: workOrder.vehicles?.make,
      vehicle_model: workOrder.vehicles?.model,
      vehicle_vin: workOrder.vehicles?.vin,
      vehicle_license_plate: workOrder.vehicles?.license_plate,
      technician: workOrder.technician 
        ? `${workOrder.technician.first_name} ${workOrder.technician.last_name}` 
        : undefined,
      // Legacy compatibility
      customer: workOrder.customers 
        ? `${workOrder.customers.first_name} ${workOrder.customers.last_name}` 
        : undefined,
      date: workOrder.created_at,
      timeEntries: [],
      inventoryItems: [],
      jobLines: []
    }));

    console.log(`Fetched ${workOrders.length} work orders with status ${status}`);
    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

/**
 * Get unique technicians from profiles table
 */
export const getUniqueTechnicians = async (): Promise<Array<{ id: string; name: string }>> => {
  try {
    console.log('Fetching unique technicians from profiles...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .not('first_name', 'is', null)
      .not('last_name', 'is', null)
      .order('first_name');

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    const technicians = (data || []).map((profile: any) => ({
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`
    }));

    console.log(`Fetched ${technicians.length} technicians`);
    return technicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};

/**
 * Get time entries for a work order
 */
async function getWorkOrderTimeEntries(workOrderId: string): Promise<TimeEntry[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }

    return (data || []).map((entry: any): TimeEntry => ({
      id: entry.id,
      work_order_id: entry.work_order_id,
      employee_id: entry.employee_id,
      employee_name: entry.employee_name,
      start_time: entry.start_time,
      end_time: entry.end_time,
      duration: entry.duration,
      billable: entry.billable,
      notes: entry.notes,
      created_at: entry.created_at
    }));
  } catch (error) {
    console.error('Error in getWorkOrderTimeEntries:', error);
    return [];
  }
}

/**
 * Get inventory items for a work order
 */
async function getWorkOrderInventoryItems(workOrderId: string): Promise<WorkOrderInventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }

    return (data || []).map((item: any): WorkOrderInventoryItem => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total || (item.quantity * item.unit_price)
    }));
  } catch (error) {
    console.error('Error in getWorkOrderInventoryItems:', error);
    return [];
  }
}

/**
 * Get job lines for a work order
 */
async function getWorkOrderJobLines(workOrderId: string): Promise<WorkOrderJobLine[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching job lines:', error);
      return [];
    }

    return (data || []).map((jobLine: any): WorkOrderJobLine => ({
      id: jobLine.id,
      workOrderId: jobLine.work_order_id,
      name: jobLine.name,
      category: jobLine.category,
      subcategory: jobLine.subcategory,
      description: jobLine.description,
      estimatedHours: jobLine.estimated_hours,
      laborRate: jobLine.labor_rate,
      totalAmount: jobLine.total_amount,
      status: jobLine.status,
      notes: jobLine.notes,
      createdAt: jobLine.created_at,
      updatedAt: jobLine.updated_at
    }));
  } catch (error) {
    console.error('Error in getWorkOrderJobLines:', error);
    return [];
  }
}
