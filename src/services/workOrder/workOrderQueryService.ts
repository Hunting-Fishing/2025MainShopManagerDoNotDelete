import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('workOrderQueryService: Fetching all work orders...');
    
    // Fetch work orders first
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

    // Get unique customer IDs and vehicle IDs
    const customerIds = [...new Set(workOrdersData.map(wo => wo.customer_id).filter(Boolean))];
    const vehicleIds = [...new Set(workOrdersData.map(wo => wo.vehicle_id).filter(Boolean))];

    // Fetch customers if we have customer IDs
    let customersMap = new Map();
    if (customerIds.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
      } else if (customersData) {
        customersData.forEach(customer => {
          customersMap.set(customer.id, customer);
        });
      }
    }

    // Fetch vehicles if we have vehicle IDs
    let vehiclesMap = new Map();
    if (vehicleIds.length > 0) {
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .in('id', vehicleIds);

      if (vehiclesError) {
        console.error('Error fetching vehicles:', vehiclesError);
      } else if (vehiclesData) {
        vehiclesData.forEach(vehicle => {
          vehiclesMap.set(vehicle.id, vehicle);
        });
      }
    }

    // Transform the data
    const workOrders: WorkOrder[] = workOrdersData.map(workOrder => {
      const customer = customersMap.get(workOrder.customer_id);
      const vehicle = vehiclesMap.get(workOrder.vehicle_id);

      return {
        // Core work order fields
        id: workOrder.id,
        work_order_number: workOrder.work_order_number,
        customer_id: workOrder.customer_id,
        vehicle_id: workOrder.vehicle_id,
        advisor_id: workOrder.advisor_id,
        technician_id: workOrder.technician_id,
        estimated_hours: workOrder.estimated_hours || 0,
        total_cost: workOrder.total_cost || 0,
        created_by: workOrder.created_by,
        created_at: workOrder.created_at,
        updated_at: workOrder.updated_at,
        start_time: workOrder.start_time,
        end_time: workOrder.end_time,
        service_category_id: workOrder.service_category_id,
        invoiced_at: workOrder.invoiced_at,
        status: workOrder.status,
        description: workOrder.description || '',
        service_type: workOrder.service_type,
        invoice_id: workOrder.invoice_id,

        // UI compatibility fields with defaults
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown Customer',
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown Customer',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.postal_code || '',
        
        technician: 'Unassigned',
        date: workOrder.created_at,
        dueDate: workOrder.end_time || workOrder.created_at,
        due_date: workOrder.end_time || workOrder.created_at,
        priority: 'medium', // Default since not in DB
        location: '',
        notes: workOrder.description || '',
        total_billable_time: 0,

        // Vehicle information with safe access
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        vehicle_odometer: '',

        // Vehicle object for newer components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Default arrays
        timeEntries: [],
        inventoryItems: [],
        inventory_items: [],
        jobLines: []
      };
    });

    console.log('workOrderQueryService: Successfully fetched and transformed work orders:', workOrders.length);
    return workOrders;

  } catch (error) {
    console.error('workOrderQueryService: Error in getAllWorkOrders:', error);
    throw error;
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    console.log('workOrderQueryService: Fetching work order by ID:', id);
    
    const { data: workOrderData, error: workOrderError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (workOrderError) {
      if (workOrderError.code === 'PGRST116') {
        console.log('Work order not found:', id);
        return null;
      }
      console.error('Error fetching work order:', workOrderError);
      throw workOrderError;
    }

    if (!workOrderData) {
      return null;
    }

    // Fetch customer and vehicle data separately
    let customer = null;
    let vehicle = null;

    if (workOrderData.customer_id) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', workOrderData.customer_id)
        .single();
      customer = customerData;
    }

    if (workOrderData.vehicle_id) {
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', workOrderData.vehicle_id)
        .single();
      vehicle = vehicleData;
    }

    // Transform the data
    const workOrder: WorkOrder = {
      // Core work order fields
      id: workOrderData.id,
      work_order_number: workOrderData.work_order_number,
      customer_id: workOrderData.customer_id,
      vehicle_id: workOrderData.vehicle_id,
      advisor_id: workOrderData.advisor_id,
      technician_id: workOrderData.technician_id,
      estimated_hours: workOrderData.estimated_hours || 0,
      total_cost: workOrderData.total_cost || 0,
      created_by: workOrderData.created_by,
      created_at: workOrderData.created_at,
      updated_at: workOrderData.updated_at,
      start_time: workOrderData.start_time,
      end_time: workOrderData.end_time,
      service_category_id: workOrderData.service_category_id,
      invoiced_at: workOrderData.invoiced_at,
      status: workOrderData.status,
      description: workOrderData.description || '',
      service_type: workOrderData.service_type,
      invoice_id: workOrderData.invoice_id,

      // UI compatibility fields
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown Customer',
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown Customer',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      customer_zip: customer?.postal_code || '',
      
      technician: 'Unassigned',
      date: workOrderData.created_at,
      dueDate: workOrderData.end_time || workOrderData.created_at,
      due_date: workOrderData.end_time || workOrderData.created_at,
      priority: 'medium', // Default since not in DB
      location: '',
      notes: workOrderData.description || '',
      total_billable_time: 0,

      // Vehicle information
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      vehicle_odometer: '',

      // Vehicle object for newer components
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim
      } : undefined,

      // Default arrays
      timeEntries: [],
      inventoryItems: [],
      inventory_items: [],
      jobLines: []
    };

    console.log('workOrderQueryService: Successfully fetched work order by ID');
    return workOrder;

  } catch (error) {
    console.error('workOrderQueryService: Error in getWorkOrderById:', error);
    throw error;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    console.log('workOrderQueryService: Fetching work orders for customer:', customerId);
    
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
      return [];
    }

    // Transform to match expected format
    const workOrders: WorkOrder[] = workOrdersData.map(workOrder => ({
      id: workOrder.id,
      work_order_number: workOrder.work_order_number,
      customer_id: workOrder.customer_id,
      vehicle_id: workOrder.vehicle_id,
      advisor_id: workOrder.advisor_id,
      technician_id: workOrder.technician_id,
      estimated_hours: workOrder.estimated_hours || 0,
      total_cost: workOrder.total_cost || 0,
      created_by: workOrder.created_by,
      created_at: workOrder.created_at,
      updated_at: workOrder.updated_at,
      start_time: workOrder.start_time,
      end_time: workOrder.end_time,
      service_category_id: workOrder.service_category_id,
      invoiced_at: workOrder.invoiced_at,
      status: workOrder.status,
      description: workOrder.description || '',
      service_type: workOrder.service_type,
      invoice_id: workOrder.invoice_id,
      
      // UI compatibility fields with defaults
      customer: 'Loading...',
      technician: 'Unassigned',
      date: workOrder.created_at,
      dueDate: workOrder.end_time || workOrder.created_at,
      due_date: workOrder.end_time || workOrder.created_at,
      priority: 'medium',
      location: '',
      notes: workOrder.description || '',
      total_billable_time: 0,
      
      // Default arrays
      timeEntries: [],
      inventoryItems: [],
      inventory_items: [],
      jobLines: []
    }));

    return workOrders;
  } catch (error) {
    console.error('workOrderQueryService: Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
}

export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform to match expected format
    return data?.map(workOrder => ({
      id: workOrder.id,
      work_order_number: workOrder.work_order_number,
      customer_id: workOrder.customer_id,
      vehicle_id: workOrder.vehicle_id,
      advisor_id: workOrder.advisor_id,
      technician_id: workOrder.technician_id,
      estimated_hours: workOrder.estimated_hours || 0,
      total_cost: workOrder.total_cost || 0,
      created_by: workOrder.created_by,
      created_at: workOrder.created_at,
      updated_at: workOrder.updated_at,
      start_time: workOrder.start_time,
      end_time: workOrder.end_time,
      service_category_id: workOrder.service_category_id,
      invoiced_at: workOrder.invoiced_at,
      status: workOrder.status,
      description: workOrder.description || '',
      service_type: workOrder.service_type,
      invoice_id: workOrder.invoice_id,
      
      // UI compatibility fields
      customer: 'Loading...',
      technician: 'Unassigned',
      date: workOrder.created_at,
      dueDate: workOrder.end_time || workOrder.created_at,
      priority: 'medium',
      location: '',
      notes: workOrder.description || '',
      total_billable_time: 0,
      
      // Default arrays
      timeEntries: [],
      inventoryItems: [],
      inventory_items: [],
      jobLines: []
    })) || [];
  } catch (error) {
    console.error('Error fetching work orders by status:', error);
    throw error;
  }
}

export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) throw error;
    
    const uniqueTechnicians = [...new Set(data?.map(item => item.technician_id).filter(Boolean))] || [];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error fetching unique technicians:', error);
    return [];
  }
}

export async function getWorkOrderTimeEntries(workOrderId: string) {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching work order time entries:', error);
    return [];
  }
}
