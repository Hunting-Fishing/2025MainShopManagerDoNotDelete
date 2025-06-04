import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';

/**
 * Get all work orders with related data
 */
export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders...');
    
    // First, get all work orders
    const { data: workOrders, error: workOrdersError } = await supabase
      .from('work_orders')
      .select(`
        id,
        customer_id,
        vehicle_id,
        advisor_id,
        technician_id,
        estimated_hours,
        total_cost,
        created_by,
        created_at,
        updated_at,
        start_time,
        end_time,
        service_category_id,
        invoiced_at,
        status,
        description,
        service_type,
        invoice_id,
        work_order_number
      `)
      .order('created_at', { ascending: false });

    if (workOrdersError) {
      console.error('Error fetching work orders:', workOrdersError);
      throw workOrdersError;
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('No work orders found');
      return [];
    }

    console.log(`Found ${workOrders.length} work orders`);

    // Get unique customer, vehicle, and technician IDs
    const customerIds = [...new Set(workOrders.map(wo => wo.customer_id).filter(Boolean))];
    const vehicleIds = [...new Set(workOrders.map(wo => wo.vehicle_id).filter(Boolean))];
    const technicianIds = [...new Set(workOrders.map(wo => wo.technician_id).filter(Boolean))];

    console.log('Fetching related data...', { 
      customers: customerIds.length, 
      vehicles: vehicleIds.length, 
      technicians: technicianIds.length 
    });

    // Fetch related data in parallel
    const [customersResult, vehiclesResult, techniciansResult] = await Promise.all([
      customerIds.length > 0 ? supabase.from('customers').select('*').in('id', customerIds) : { data: [], error: null },
      vehicleIds.length > 0 ? supabase.from('vehicles').select('*').in('id', vehicleIds) : { data: [], error: null },
      technicianIds.length > 0 ? supabase.from('profiles').select('*').in('id', technicianIds) : { data: [], error: null }
    ]);

    // Handle any errors from the related data fetches
    if (customersResult.error) {
      console.error('Error fetching customers:', customersResult.error);
    }
    if (vehiclesResult.error) {
      console.error('Error fetching vehicles:', vehiclesResult.error);
    }
    if (techniciansResult.error) {
      console.error('Error fetching technicians:', techniciansResult.error);
    }

    // Create lookup maps for efficient data joining
    const customersMap = new Map((customersResult.data || []).map(customer => [customer.id, customer]));
    const vehiclesMap = new Map((vehiclesResult.data || []).map(vehicle => [vehicle.id, vehicle]));
    const techniciansMap = new Map((techniciansResult.data || []).map(tech => [tech.id, tech]));

    // Transform work orders to include related data
    const enrichedWorkOrders: WorkOrder[] = await Promise.all(
      workOrders.map(async (workOrder) => {
        const customer = customersMap.get(workOrder.customer_id);
        const vehicle = vehiclesMap.get(workOrder.vehicle_id);
        const technician = techniciansMap.get(workOrder.technician_id);

        // Fetch time entries and inventory items for this work order
        const [timeEntriesResult, inventoryItemsResult, jobLinesResult] = await Promise.all([
          supabase.rpc('get_work_order_time_entries', { work_order_id: workOrder.id }),
          supabase.rpc('get_work_order_inventory_items', { work_order_id: workOrder.id }),
          supabase.rpc('get_work_order_job_lines', { work_order_id_param: workOrder.id })
        ]);

        // Map time entries
        const timeEntries: TimeEntry[] = (timeEntriesResult.data || []).map((entry: any) => ({
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

        // Map inventory items with calculated total
        const inventoryItems: WorkOrderInventoryItem[] = (inventoryItemsResult.data || []).map((item: any) => ({
          id: item.id,
          workOrderId: item.work_order_id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price // Calculate total here
        }));

        // Map job lines
        const jobLines: WorkOrderJobLine[] = (jobLinesResult.data || []).map((jobLine: any) => ({
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
          updatedAt: jobLine.updated_at
        }));

        return {
          ...workOrder,
          // Customer info
          customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
          customer_email: customer?.email || '',
          customer_phone: customer?.phone || '',
          customer_address: customer?.address || '',
          customer_city: customer?.city || '',
          customer_state: customer?.state || '',
          customer_zip: customer?.postal_code || '',
          // Vehicle info  
          vehicle_make: vehicle?.make || '',
          vehicle_model: vehicle?.model || '',
          vehicle_year: vehicle?.year || '',
          vehicle_vin: vehicle?.vin || '',
          vehicle_license_plate: vehicle?.license_plate || '',
          // Technician info
          technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
          // Vehicle object
          vehicle: vehicle ? {
            id: vehicle.id,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            vin: vehicle.vin,
            license_plate: vehicle.license_plate,
            trim: vehicle.trim || ''
          } : undefined,
          // Related data
          timeEntries,
          inventoryItems,
          jobLines,
          // Legacy compatibility
          customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
          date: workOrder.created_at,
          dueDate: workOrder.end_time,
          priority: 'medium',
          location: '',
          notes: workOrder.description || ''
        };
      })
    );

    console.log(`Successfully enriched ${enrichedWorkOrders.length} work orders with related data`);
    return enrichedWorkOrders;

  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw new Error('Failed to fetch work orders');
  }
}

/**
 * Get a specific work order by ID with all related data
 */
export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    console.log('Fetching work order by ID:', id);
    
    // Get the specific work order
    const { data: workOrder, error: workOrderError } = await supabase
      .from('work_orders')
      .select(`
        id,
        customer_id,
        vehicle_id,
        advisor_id,
        technician_id,
        estimated_hours,
        total_cost,
        created_by,
        created_at,
        updated_at,
        start_time,
        end_time,
        service_category_id,
        invoiced_at,
        status,
        description,
        service_type,
        invoice_id,
        work_order_number
      `)
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

    if (!workOrder) {
      console.log('Work order not found:', id);
      return null;
    }

    console.log('Found work order, fetching related data...');

    // Fetch related data in parallel
    const [customerResult, vehicleResult, technicianResult, timeEntriesResult, inventoryItemsResult, jobLinesResult] = await Promise.all([
      workOrder.customer_id ? supabase.from('customers').select('*').eq('id', workOrder.customer_id).single() : { data: null, error: null },
      workOrder.vehicle_id ? supabase.from('vehicles').select('*').eq('id', workOrder.vehicle_id).single() : { data: null, error: null },
      workOrder.technician_id ? supabase.from('profiles').select('*').eq('id', workOrder.technician_id).single() : { data: null, error: null },
      supabase.rpc('get_work_order_time_entries', { work_order_id: workOrder.id }),
      supabase.rpc('get_work_order_inventory_items', { work_order_id: workOrder.id }),
      supabase.rpc('get_work_order_job_lines', { work_order_id_param: workOrder.id })
    ]);

    const customer = customerResult.data;
    const vehicle = vehicleResult.data;
    const technician = technicianResult.data;

    // Map time entries
    const timeEntries: TimeEntry[] = (timeEntriesResult.data || []).map((entry: any) => ({
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

    // Map inventory items with calculated total
    const inventoryItems: WorkOrderInventoryItem[] = (inventoryItemsResult.data || []).map((item: any) => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price // Calculate total here
    }));

    // Map job lines
    const jobLines: WorkOrderJobLine[] = (jobLinesResult.data || []).map((jobLine: any) => ({
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
      updatedAt: jobLine.updated_at
    }));

    const enrichedWorkOrder: WorkOrder = {
      ...workOrder,
      // Customer info
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      customer_zip: customer?.postal_code || '',
      // Vehicle info
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_year: vehicle?.year || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      // Technician info
      technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
      // Vehicle object
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim || ''
      } : undefined,
      // Related data
      timeEntries,
      inventoryItems,
      jobLines,
      // Legacy compatibility
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      date: workOrder.created_at,
      dueDate: workOrder.end_time,
      priority: 'medium',
      location: '',
      notes: workOrder.description || ''
    };

    console.log('Successfully enriched work order with related data');
    return enrichedWorkOrder;

  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw new Error('Failed to fetch work order');
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
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw new Error('Failed to fetch work orders for customer');
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

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw new Error('Failed to fetch work orders by status');
  }
}

export async function getUniqueTechnicians(): Promise<{ id: string; name: string }[]> {
  try {
    console.log('Fetching unique technicians...');
    
    // Get all unique technician IDs from work orders
    const { data: workOrders, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (workOrdersError) {
      console.error('Error fetching technician IDs:', workOrdersError);
      throw workOrdersError;
    }

    const technicianIds = [...new Set(workOrders?.map(wo => wo.technician_id).filter(Boolean) || [])];

    if (technicianIds.length === 0) {
      return [];
    }

    // Fetch technician details
    const { data: technicians, error: techniciansError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', technicianIds);

    if (techniciansError) {
      console.error('Error fetching technicians:', techniciansError);
      throw techniciansError;
    }

    return (technicians || []).map(tech => ({
      id: tech.id,
      name: `${tech.first_name || ''} ${tech.last_name || ''}`.trim() || 'Unknown'
    }));
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw new Error('Failed to fetch unique technicians');
  }
}
