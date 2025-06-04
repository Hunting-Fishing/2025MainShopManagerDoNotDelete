
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";

/**
 * Get all work orders with their related data
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getAllWorkOrders: Starting to fetch all work orders...');
    
    const { data: workOrdersData, error } = await supabase
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
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllWorkOrders: Error fetching work orders:', error);
      throw error;
    }

    if (!workOrdersData) {
      console.log('getAllWorkOrders: No work orders found');
      return [];
    }

    console.log('getAllWorkOrders: Found work orders:', workOrdersData.length);

    // Fetch related data for each work order
    const workOrdersWithRelatedData = await Promise.all(
      workOrdersData.map(async (workOrder) => {
        try {
          // Fetch time entries
          const { data: timeEntries } = await supabase
            .from('work_order_time_entries')
            .select('*')
            .eq('work_order_id', workOrder.id);

          // Fetch inventory items
          const { data: inventoryItems } = await supabase
            .from('work_order_inventory_items')
            .select('*')
            .eq('work_order_id', workOrder.id);

          // Fetch job lines
          const { data: jobLines } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', workOrder.id)
            .order('display_order', { ascending: true });

          return mapDbWorkOrderToWorkOrder(workOrder, timeEntries || [], inventoryItems || [], jobLines || []);
        } catch (error) {
          console.error('getAllWorkOrders: Error fetching related data for work order:', workOrder.id, error);
          return mapDbWorkOrderToWorkOrder(workOrder, [], [], []);
        }
      })
    );

    console.log('getAllWorkOrders: Successfully mapped work orders with related data');
    return workOrdersWithRelatedData;
  } catch (error) {
    console.error('getAllWorkOrders: Error in getAllWorkOrders:', error);
    throw error;
  }
};

/**
 * Get work order by ID with all related data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('getWorkOrderById: Fetching work order with ID:', id);
    
    const { data: workOrderData, error } = await supabase
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
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('getWorkOrderById: Error fetching work order:', error);
      throw error;
    }

    if (!workOrderData) {
      console.log('getWorkOrderById: Work order not found');
      return null;
    }

    // Fetch related data
    const [
      { data: timeEntries },
      { data: inventoryItems },
      { data: jobLines }
    ] = await Promise.all([
      supabase
        .from('work_order_time_entries')
        .select('*')
        .eq('work_order_id', id),
      supabase
        .from('work_order_inventory_items')
        .select('*')
        .eq('work_order_id', id),
      supabase
        .from('work_order_job_lines')
        .select('*')
        .eq('work_order_id', id)
        .order('display_order', { ascending: true })
    ]);

    const mappedWorkOrder = mapDbWorkOrderToWorkOrder(
      workOrderData, 
      timeEntries || [], 
      inventoryItems || [], 
      jobLines || []
    );

    console.log('getWorkOrderById: Successfully fetched and mapped work order');
    return mappedWorkOrder;
  } catch (error) {
    console.error('getWorkOrderById: Error:', error);
    return null;
  }
};

/**
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersByCustomerId: Fetching work orders for customer:', customerId);
    
    const { data: workOrdersData, error } = await supabase
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
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrdersByCustomerId: Error fetching work orders:', error);
      throw error;
    }

    if (!workOrdersData) {
      console.log('getWorkOrdersByCustomerId: No work orders found for customer');
      return [];
    }

    // Fetch related data for each work order
    const workOrdersWithRelatedData = await Promise.all(
      workOrdersData.map(async (workOrder) => {
        try {
          const [
            { data: timeEntries },
            { data: inventoryItems },
            { data: jobLines }
          ] = await Promise.all([
            supabase
              .from('work_order_time_entries')
              .select('*')
              .eq('work_order_id', workOrder.id),
            supabase
              .from('work_order_inventory_items')
              .select('*')
              .eq('work_order_id', workOrder.id),
            supabase
              .from('work_order_job_lines')
              .select('*')
              .eq('work_order_id', workOrder.id)
              .order('display_order', { ascending: true })
          ]);

          return mapDbWorkOrderToWorkOrder(workOrder, timeEntries || [], inventoryItems || [], jobLines || []);
        } catch (error) {
          console.error('getWorkOrdersByCustomerId: Error fetching related data:', error);
          return mapDbWorkOrderToWorkOrder(workOrder, [], [], []);
        }
      })
    );

    console.log('getWorkOrdersByCustomerId: Successfully fetched work orders for customer');
    return workOrdersWithRelatedData;
  } catch (error) {
    console.error('getWorkOrdersByCustomerId: Error:', error);
    throw error;
  }
};

/**
 * Get work orders for calendar display
 */
export const getWorkOrdersForCalendar = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersForCalendar: Fetching work orders for calendar...');
    
    const { data: workOrdersData, error } = await supabase
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
        )
      `)
      .not('start_time', 'is', null)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('getWorkOrdersForCalendar: Error fetching work orders:', error);
      throw error;
    }

    if (!workOrdersData) {
      console.log('getWorkOrdersForCalendar: No scheduled work orders found');
      return [];
    }

    // Map to work orders without fetching all related data for performance
    const mappedWorkOrders = workOrdersData.map(workOrder => 
      mapDbWorkOrderToWorkOrder(workOrder, [], [], [])
    );

    console.log('getWorkOrdersForCalendar: Successfully fetched calendar work orders');
    return mappedWorkOrders;
  } catch (error) {
    console.error('getWorkOrdersForCalendar: Error:', error);
    throw error;
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<Array<{id: string, name: string}>> => {
  try {
    console.log('getUniqueTechnicians: Fetching unique technicians...');
    
    const { data: workOrdersData, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('getUniqueTechnicians: Error fetching technicians:', error);
      throw error;
    }

    if (!workOrdersData) {
      console.log('getUniqueTechnicians: No technicians found');
      return [];
    }

    // Get unique technician IDs
    const uniqueTechnicianIds = [...new Set(workOrdersData.map(wo => wo.technician_id).filter(Boolean))];
    
    // For now, return technician IDs as both id and name
    // In a real app, you'd fetch technician names from a profiles/users table
    const technicians = uniqueTechnicianIds.map(id => ({
      id: id!,
      name: `Technician ${id!.slice(0, 8)}` // Use first 8 chars of UUID as display name
    }));

    console.log('getUniqueTechnicians: Successfully fetched technicians');
    return technicians;
  } catch (error) {
    console.error('getUniqueTechnicians: Error:', error);
    return [];
  }
};

/**
 * Helper function to map database work order to application WorkOrder type
 */
const mapDbWorkOrderToWorkOrder = (
  dbWorkOrder: any,
  timeEntries: any[] = [],
  inventoryItems: any[] = [],
  jobLines: any[] = []
): WorkOrder => {
  // Handle customer data safely
  const customer = dbWorkOrder.customers;
  const customerName = customer && !customer.error ? 
    `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '';
  const customerEmail = customer && !customer.error ? customer.email : null;
  const customerPhone = customer && !customer.error ? customer.phone : null;

  // Handle vehicle data safely
  const vehicle = dbWorkOrder.vehicles;
  const vehicleData = vehicle && !vehicle.error ? {
    id: vehicle.id || '',
    year: vehicle.year || '',
    make: vehicle.make || '',
    model: vehicle.model || '',
    vin: vehicle.vin || '',
    license_plate: vehicle.license_plate || '',
    trim: ''
  } : {
    id: '',
    year: '',
    make: '',
    model: '',
    vin: '',
    license_plate: '',
    trim: ''
  };

  // Map job lines with proper field name conversion
  const mappedJobLines: WorkOrderJobLine[] = jobLines.map(jobLine => ({
    id: jobLine.id,
    workOrderId: jobLine.work_order_id,
    name: jobLine.name,
    category: jobLine.category,
    subcategory: jobLine.subcategory,
    description: jobLine.description,
    estimatedHours: jobLine.estimated_hours,
    laborRate: jobLine.labor_rate,
    totalAmount: jobLine.total_amount,
    status: jobLine.status as 'pending' | 'in-progress' | 'completed' | 'on-hold',
    notes: jobLine.notes,
    createdAt: jobLine.created_at, // Convert snake_case to camelCase
    updatedAt: jobLine.updated_at  // Convert snake_case to camelCase
  }));

  return {
    id: dbWorkOrder.id,
    work_order_number: dbWorkOrder.work_order_number,
    customer_id: dbWorkOrder.customer_id,
    vehicle_id: dbWorkOrder.vehicle_id,
    advisor_id: dbWorkOrder.advisor_id,
    technician_id: dbWorkOrder.technician_id,
    estimated_hours: dbWorkOrder.estimated_hours,
    total_cost: dbWorkOrder.total_cost,
    created_by: dbWorkOrder.created_by,
    created_at: dbWorkOrder.created_at,
    updated_at: dbWorkOrder.updated_at,
    start_time: dbWorkOrder.start_time,
    end_time: dbWorkOrder.end_time,
    service_category_id: dbWorkOrder.service_category_id,
    invoiced_at: dbWorkOrder.invoiced_at,
    status: dbWorkOrder.status,
    description: dbWorkOrder.description || '',
    service_type: dbWorkOrder.service_type,
    invoice_id: dbWorkOrder.invoice_id,

    // Computed/mapped fields for backward compatibility
    customer: customerName,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    technician: dbWorkOrder.technician_id || '',
    date: dbWorkOrder.created_at,
    dueDate: dbWorkOrder.end_time,
    due_date: dbWorkOrder.end_time,
    priority: 'medium', // Default priority
    location: '', // Default location
    notes: dbWorkOrder.description || '',
    total_billable_time: 0, // Will be calculated from time entries
    
    // Vehicle fields for backward compatibility
    vehicle_year: vehicleData.year,
    vehicle_make: vehicleData.make,
    vehicle_model: vehicleData.model,
    vehicle_vin: vehicleData.vin,
    vehicle_license_plate: vehicleData.license_plate,
    
    // Related data
    vehicle: vehicleData,
    timeEntries: timeEntries || [],
    inventoryItems: inventoryItems || [],
    inventory_items: inventoryItems || [],
    jobLines: mappedJobLines // Now properly mapped
  };
};
