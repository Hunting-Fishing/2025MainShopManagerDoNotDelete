
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { mapFromDbWorkOrder, mapTimeEntryFromDb, mapInventoryItemFromDb } from "@/utils/supabaseMappers";

/**
 * Get all work orders from the database
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders...');
    
    // First get work orders
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (workOrdersError) {
      console.error('Error fetching work orders:', workOrdersError);
      throw workOrdersError;
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      console.log('No work orders found');
      return [];
    }

    console.log(`Found ${workOrdersData.length} work orders`);

    // Get unique customer and vehicle IDs
    const customerIds = [...new Set(workOrdersData.map(wo => wo.customer_id).filter(Boolean))];
    const vehicleIds = [...new Set(workOrdersData.map(wo => wo.vehicle_id).filter(Boolean))];

    // Fetch customers and vehicles separately
    const customersPromise = customerIds.length > 0 
      ? supabase.from('customers').select('*').in('id', customerIds)
      : Promise.resolve({ data: [], error: null });

    const vehiclesPromise = vehicleIds.length > 0
      ? supabase.from('vehicles').select('*').in('id', vehicleIds)
      : Promise.resolve({ data: [], error: null });

    const [customersResult, vehiclesResult] = await Promise.all([
      customersPromise,
      vehiclesPromise
    ]);

    if (customersResult.error) {
      console.error('Error fetching customers:', customersResult.error);
    }

    if (vehiclesResult.error) {
      console.error('Error fetching vehicles:', vehiclesResult.error);
    }

    const customers = customersResult.data || [];
    const vehicles = vehiclesResult.data || [];

    // Create lookup maps
    const customerMap = new Map(customers.map(c => [c.id, c]));
    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

    // Transform work orders with related data
    const workOrders: WorkOrder[] = workOrdersData.map(workOrder => {
      const customer = workOrder.customer_id ? customerMap.get(workOrder.customer_id) : null;
      const vehicle = workOrder.vehicle_id ? vehicleMap.get(workOrder.vehicle_id) : null;

      return {
        id: workOrder.id,
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customerEmail: customer?.email || '',
        customerPhone: customer?.phone || '',
        customerName: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        description: workOrder.description || '',
        status: workOrder.status as WorkOrder['status'],
        priority: workOrder.priority as WorkOrder['priority'] || 'medium',
        date: workOrder.created_at,
        dueDate: workOrder.end_time || workOrder.created_at,
        technician: workOrder.technician_id || 'Unassigned',
        location: workOrder.service_type || '',
        notes: workOrder.description || '',
        total_billable_time: 0,
        created_at: workOrder.created_at,
        updated_at: workOrder.updated_at,
        timeEntries: [],
        inventoryItems: [],
        vehicleInfo: vehicle ? {
          id: vehicle.id,
          year: vehicle.year?.toString() || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          vin: vehicle.vin || '',
          licensePlate: vehicle.license_plate || ''
        } : undefined
      };
    });

    console.log(`Successfully processed ${workOrders.length} work orders`);
    return workOrders;

  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw new Error(`Failed to fetch work orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get a single work order by ID
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log(`Fetching work order with ID: ${id}`);
    
    const { data: workOrderData, error: workOrderError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (workOrderError) {
      console.error('Error fetching work order:', workOrderError);
      throw workOrderError;
    }

    if (!workOrderData) {
      console.log(`No work order found with ID: ${id}`);
      return null;
    }

    // Fetch related customer and vehicle data
    const customerPromise = workOrderData.customer_id 
      ? supabase.from('customers').select('*').eq('id', workOrderData.customer_id).maybeSingle()
      : Promise.resolve({ data: null, error: null });

    const vehiclePromise = workOrderData.vehicle_id
      ? supabase.from('vehicles').select('*').eq('id', workOrderData.vehicle_id).maybeSingle()
      : Promise.resolve({ data: null, error: null });

    const [customerResult, vehicleResult] = await Promise.all([
      customerPromise,
      vehiclePromise
    ]);

    if (customerResult.error) {
      console.error('Error fetching customer:', customerResult.error);
    }

    if (vehicleResult.error) {
      console.error('Error fetching vehicle:', vehicleResult.error);
    }

    const customer = customerResult.data;
    const vehicle = vehicleResult.data;

    const workOrder: WorkOrder = {
      id: workOrderData.id,
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customerEmail: customer?.email || '',
      customerPhone: customer?.phone || '',
      customerName: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      description: workOrderData.description || '',
      status: workOrderData.status as WorkOrder['status'],
      priority: workOrderData.priority as WorkOrder['priority'] || 'medium',
      date: workOrderData.created_at,
      dueDate: workOrderData.end_time || workOrderData.created_at,
      technician: workOrderData.technician_id || 'Unassigned',
      location: workOrderData.service_type || '',
      notes: workOrderData.description || '',
      total_billable_time: 0,
      created_at: workOrderData.created_at,
      updated_at: workOrderData.updated_at,
      timeEntries: [],
      inventoryItems: [],
      vehicleInfo: vehicle ? {
        id: vehicle.id,
        year: vehicle.year?.toString() || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        vin: vehicle.vin || '',
        licensePlate: vehicle.license_plate || ''
      } : undefined
    };

    console.log('Successfully fetched work order:', workOrder);
    return workOrder;

  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw new Error(`Failed to fetch work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log(`Fetching work orders for customer: ${customerId}`);
    
    const { data: workOrdersData, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      console.log(`No work orders found for customer: ${customerId}`);
      return [];
    }

    // Get customer data
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();

    // Get vehicle IDs and fetch vehicle data
    const vehicleIds = [...new Set(workOrdersData.map(wo => wo.vehicle_id).filter(Boolean))];
    const { data: vehiclesData } = vehicleIds.length > 0 
      ? await supabase.from('vehicles').select('*').in('id', vehicleIds)
      : { data: [] };

    const vehicleMap = new Map((vehiclesData || []).map(v => [v.id, v]));

    const workOrders: WorkOrder[] = workOrdersData.map(workOrder => {
      const vehicle = workOrder.vehicle_id ? vehicleMap.get(workOrder.vehicle_id) : null;

      return {
        id: workOrder.id,
        customer: customerData ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() : '',
        customerEmail: customerData?.email || '',
        customerPhone: customerData?.phone || '',
        customerName: customerData ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() : '',
        description: workOrder.description || '',
        status: workOrder.status as WorkOrder['status'],
        priority: workOrder.priority as WorkOrder['priority'] || 'medium',
        date: workOrder.created_at,
        dueDate: workOrder.end_time || workOrder.created_at,
        technician: workOrder.technician_id || 'Unassigned',
        location: workOrder.service_type || '',
        notes: workOrder.description || '',
        total_billable_time: 0,
        created_at: workOrder.created_at,
        updated_at: workOrder.updated_at,
        timeEntries: [],
        inventoryItems: [],
        vehicleInfo: vehicle ? {
          id: vehicle.id,
          year: vehicle.year?.toString() || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          vin: vehicle.vin || '',
          licensePlate: vehicle.license_plate || ''
        } : undefined
      };
    });

    console.log(`Successfully fetched ${workOrders.length} work orders for customer`);
    return workOrders;

  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw new Error(`Failed to fetch work orders for customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work orders by status
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    if (!data) return [];

    // Transform to WorkOrder format
    return data.map(workOrder => ({
      id: workOrder.id,
      customer: '',
      description: workOrder.description || '',
      status: workOrder.status as WorkOrder['status'],
      priority: workOrder.priority as WorkOrder['priority'] || 'medium',
      date: workOrder.created_at,
      dueDate: workOrder.end_time || workOrder.created_at,
      technician: workOrder.technician_id || 'Unassigned',
      location: workOrder.service_type || '',
      notes: workOrder.description || '',
      total_billable_time: 0,
      created_at: workOrder.created_at,
      updated_at: workOrder.updated_at,
      timeEntries: [],
      inventoryItems: []
    }));

  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw new Error(`Failed to fetch work orders by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    if (!data) return [];

    const uniqueTechnicians = [...new Set(data.map(wo => wo.technician_id).filter(Boolean))];
    return uniqueTechnicians;

  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw new Error(`Failed to fetch technicians: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work order time entries
 */
export const getWorkOrderTimeEntries = async (workOrderId: string): Promise<TimeEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }

    if (!data) return [];

    return data.map(mapTimeEntryFromDb);

  } catch (error) {
    console.error('Error in getWorkOrderTimeEntries:', error);
    throw new Error(`Failed to fetch time entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
