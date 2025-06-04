
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderInventoryItem } from "@/types/workOrder";

/**
 * Get all work orders with related data
 */
export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
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
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    if (!data) return [];

    // Get inventory items separately
    const workOrderIds = data.map(wo => wo.id);
    const { data: inventoryData } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .in('work_order_id', workOrderIds);

    // Get time entries separately
    const { data: timeData } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .in('work_order_id', workOrderIds);

    // Get job lines separately
    const { data: jobLinesData } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .in('work_order_id', workOrderIds);

    return data.map(workOrder => {
      const customer = workOrder.customers as any;
      const vehicle = workOrder.vehicles as any;
      
      const inventoryItems = (inventoryData || [])
        .filter(item => item.work_order_id === workOrder.id)
        .map(item => ({
          id: item.id,
          workOrderId: item.work_order_id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          notes: '' // Set default empty string
        }));

      const timeEntries = (timeData || [])
        .filter(entry => entry.work_order_id === workOrder.id);

      const jobLines = (jobLinesData || [])
        .filter(line => line.work_order_id === workOrder.id);

      return {
        ...workOrder,
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        technician: '', // Will be populated separately if needed
        date: workOrder.created_at,
        dueDate: workOrder.end_time,
        due_date: workOrder.end_time,
        priority: 'medium', // Default priority
        location: '', // Default location
        notes: workOrder.description || '',
        timeEntries: timeEntries || [],
        inventoryItems,
        inventory_items: inventoryItems,
        jobLines: jobLines || [],
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year?.toString() || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          vin: vehicle.vin || '',
          license_plate: vehicle.license_plate || '',
          trim: ''
        } : undefined,
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || ''
      } as WorkOrder;
    });
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
}

/**
 * Get a specific work order by ID
 */
export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
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
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) return null;

    // Get related data separately
    const [inventoryResult, timeResult, jobLinesResult] = await Promise.all([
      supabase
        .from('work_order_inventory_items')
        .select('*')
        .eq('work_order_id', id),
      supabase
        .from('work_order_time_entries')
        .select('*')
        .eq('work_order_id', id),
      supabase
        .from('work_order_job_lines')
        .select('*')
        .eq('work_order_id', id)
    ]);

    const customer = data.customers as any;
    const vehicle = data.vehicles as any;

    const inventoryItems = (inventoryResult.data || []).map(item => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      notes: '' // Set default empty string
    }));

    return {
      ...data,
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      technician: '', // Will be populated separately if needed
      date: data.created_at,
      dueDate: data.end_time,
      due_date: data.end_time,
      priority: 'medium', // Default priority
      location: '', // Default location
      notes: data.description || '',
      timeEntries: timeResult.data || [],
      inventoryItems,
      inventory_items: inventoryItems,
      jobLines: jobLinesResult.data || [],
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year?.toString() || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || '',
        trim: ''
      } : undefined,
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || ''
    } as WorkOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
}

/**
 * Get work orders by customer ID
 */
export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
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
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer:', error);
      throw error;
    }

    if (!data) return [];

    // Get inventory items separately
    const workOrderIds = data.map(wo => wo.id);
    const { data: inventoryData } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .in('work_order_id', workOrderIds);

    // Get time entries separately
    const { data: timeData } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .in('work_order_id', workOrderIds);

    return data.map(workOrder => {
      const customer = workOrder.customers as any;
      const vehicle = workOrder.vehicles as any;
      
      const inventoryItems = (inventoryData || [])
        .filter(item => item.work_order_id === workOrder.id)
        .map(item => ({
          id: item.id,
          workOrderId: item.work_order_id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          notes: '' // Set default empty string
        }));

      const timeEntries = (timeData || [])
        .filter(entry => entry.work_order_id === workOrder.id);

      return {
        ...workOrder,
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        technician: '', // Will be populated separately if needed
        date: workOrder.created_at,
        dueDate: workOrder.end_time,
        due_date: workOrder.end_time,
        priority: 'medium', // Default priority
        location: '', // Default location
        notes: workOrder.description || '',
        timeEntries: timeEntries || [],
        inventoryItems,
        inventory_items: inventoryItems,
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year?.toString() || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          vin: vehicle.vin || '',
          license_plate: vehicle.license_plate || '',
          trim: ''
        } : undefined,
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || ''
      } as WorkOrder;
    });
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
}

/**
 * Get work orders for calendar display
 */
export async function getWorkOrdersForCalendar(): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .not('start_time', 'is', null)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching calendar work orders:', error);
      throw error;
    }

    if (!data) return [];

    return data.map(workOrder => {
      const customer = workOrder.customers as any;
      
      return {
        ...workOrder,
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        technician: '', // Will be populated separately if needed
        date: workOrder.created_at,
        dueDate: workOrder.end_time,
        due_date: workOrder.end_time,
        priority: 'medium', // Default priority
        location: '', // Default location
        notes: workOrder.description || '',
        timeEntries: [],
        inventoryItems: [],
        inventory_items: []
      } as WorkOrder;
    });
  } catch (error) {
    console.error('Error in getWorkOrdersForCalendar:', error);
    throw error;
  }
}

/**
 * Get unique technicians from work orders
 */
export async function getUniqueTechnicians(): Promise<Array<{id: string; name: string}>> {
  try {
    // Get unique technician IDs from work orders
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technician IDs:', error);
      return [];
    }

    if (!workOrders || workOrders.length === 0) return [];

    // Get unique technician IDs
    const uniqueTechnicianIds = [...new Set(workOrders.map(wo => wo.technician_id))].filter(Boolean);

    if (uniqueTechnicianIds.length === 0) return [];

    // Get technician details from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', uniqueTechnicianIds);

    if (profilesError) {
      console.error('Error fetching technician profiles:', profilesError);
      return [];
    }

    if (!profiles) return [];

    return profiles.map(profile => ({
      id: profile.id,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Technician'
    }));
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
}
