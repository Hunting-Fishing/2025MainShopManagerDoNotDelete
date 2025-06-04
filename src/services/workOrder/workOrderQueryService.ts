
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  console.log('Fetching all work orders with detailed joins...');
  
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customer:customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone, address, city, state),
      vehicle:vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate),
      technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
      job_lines:work_order_job_lines(*),
      inventory_items:work_order_inventory_items(*),
      time_entries:work_order_time_entries(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }

  return data?.map(wo => {
    console.log('Processing work order:', wo.id);
    console.log('Customer data:', wo.customer);
    console.log('Vehicle data:', wo.vehicle);
    console.log('Technician data:', wo.technician);

    // Map job lines with proper date mapping
    const jobLines: WorkOrderJobLine[] = (wo.job_lines || []).map((jl: any) => ({
      id: jl.id,
      workOrderId: jl.work_order_id,
      name: jl.name,
      category: jl.category,
      subcategory: jl.subcategory,
      description: jl.description,
      estimatedHours: jl.estimated_hours,
      laborRate: jl.labor_rate,
      laborRateType: jl.labor_rate_type,
      totalAmount: jl.total_amount,
      status: jl.status,
      notes: jl.notes,
      displayOrder: jl.display_order,
      createdAt: jl.created_at,
      updatedAt: jl.updated_at
    }));

    // Map inventory items with calculated total
    const inventoryItems: WorkOrderInventoryItem[] = (wo.inventory_items || []).map((item: any) => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price
    }));

    // Map time entries with work_order_id
    const timeEntries: TimeEntry[] = (wo.time_entries || []).map((entry: any) => ({
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

    const mappedWorkOrder: WorkOrder = {
      // Core work order fields
      id: wo.id,
      customer_id: wo.customer_id,
      vehicle_id: wo.vehicle_id,
      advisor_id: wo.advisor_id,
      technician_id: wo.technician_id,
      estimated_hours: wo.estimated_hours,
      total_cost: wo.total_cost,
      created_by: wo.created_by,
      created_at: wo.created_at,
      updated_at: wo.updated_at,
      start_time: wo.start_time,
      end_time: wo.end_time,
      service_category_id: wo.service_category_id,
      invoiced_at: wo.invoiced_at,
      status: wo.status,
      description: wo.description,
      service_type: wo.service_type,
      invoice_id: wo.invoice_id,
      work_order_number: wo.work_order_number,
      
      // Customer information as strings (for backward compatibility)
      customer: wo.customer ? `${wo.customer.first_name} ${wo.customer.last_name}` : '',
      customer_name: wo.customer ? `${wo.customer.first_name} ${wo.customer.last_name}` : '',
      customer_email: wo.customer?.email || '',
      customer_phone: wo.customer?.phone || '',
      customer_address: wo.customer?.address || '',
      customer_city: wo.customer?.city || '',
      customer_state: wo.customer?.state || '',
      
      // Vehicle information
      vehicle: wo.vehicle ? {
        id: wo.vehicle.id,
        year: wo.vehicle.year?.toString() || '',
        make: wo.vehicle.make || '',
        model: wo.vehicle.model || '',
        vin: wo.vehicle.vin || '',
        license_plate: wo.vehicle.license_plate || ''
      } : undefined,
      vehicle_make: wo.vehicle?.make || '',
      vehicle_model: wo.vehicle?.model || '',
      vehicle_year: wo.vehicle?.year?.toString() || '',
      vehicle_vin: wo.vehicle?.vin || '',
      vehicle_license_plate: wo.vehicle?.license_plate || '',
      
      // Technician information as string (for backward compatibility)
      technician: wo.technician ? `${wo.technician.first_name} ${wo.technician.last_name}` : '',
      
      // Related data
      jobLines,
      inventoryItems,
      inventory_items: inventoryItems,
      timeEntries,
      
      // Additional fields for UI compatibility
      date: wo.created_at,
      dueDate: wo.end_time,
      due_date: wo.end_time,
      priority: 'medium',
      location: '',
      notes: wo.description || ''
    };

    return mappedWorkOrder;
  }) || [];
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  console.log('Fetching work order by ID:', id);
  
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customer:customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone, address, city, state),
      vehicle:vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate),
      technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
      job_lines:work_order_job_lines(*),
      inventory_items:work_order_inventory_items(*),
      time_entries:work_order_time_entries(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching work order:', error);
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  if (!data) {
    console.log('No work order found for ID:', id);
    return null;
  }

  console.log('Found work order:', data.id);
  console.log('Customer data:', data.customer);
  console.log('Vehicle data:', data.vehicle);
  console.log('Job lines data:', data.job_lines);

  // Map job lines with proper date mapping
  const jobLines: WorkOrderJobLine[] = (data.job_lines || []).map((jl: any) => ({
    id: jl.id,
    workOrderId: jl.work_order_id,
    name: jl.name,
    category: jl.category,
    subcategory: jl.subcategory,
    description: jl.description,
    estimatedHours: jl.estimated_hours,
    laborRate: jl.labor_rate,
    laborRateType: jl.labor_rate_type,
    totalAmount: jl.total_amount,
    status: jl.status,
    notes: jl.notes,
    displayOrder: jl.display_order,
    createdAt: jl.created_at,
    updatedAt: jl.updated_at
  }));

  // Map inventory items with calculated total
  const inventoryItems: WorkOrderInventoryItem[] = (data.inventory_items || []).map((item: any) => ({
    id: item.id,
    workOrderId: item.work_order_id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.quantity * item.unit_price
  }));

  // Map time entries with work_order_id
  const timeEntries: TimeEntry[] = (data.time_entries || []).map((entry: any) => ({
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

  const mappedWorkOrder: WorkOrder = {
    // Core work order fields
    id: data.id,
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
    work_order_number: data.work_order_number,
    
    // Customer information as strings (for backward compatibility)
    customer: data.customer ? `${data.customer.first_name} ${data.customer.last_name}` : '',
    customer_name: data.customer ? `${data.customer.first_name} ${data.customer.last_name}` : '',
    customer_email: data.customer?.email || '',
    customer_phone: data.customer?.phone || '',
    customer_address: data.customer?.address || '',
    customer_city: data.customer?.city || '',
    customer_state: data.customer?.state || '',
    
    // Vehicle information
    vehicle: data.vehicle ? {
      id: data.vehicle.id,
      year: data.vehicle.year?.toString() || '',
      make: data.vehicle.make || '',
      model: data.vehicle.model || '',
      vin: data.vehicle.vin || '',
      license_plate: data.vehicle.license_plate || ''
    } : undefined,
    vehicle_make: data.vehicle?.make || '',
    vehicle_model: data.vehicle?.model || '',
    vehicle_year: data.vehicle?.year?.toString() || '',
    vehicle_vin: data.vehicle?.vin || '',
    vehicle_license_plate: data.vehicle?.license_plate || '',
    
    // Technician information as string (for backward compatibility)
    technician: data.technician ? `${data.technician.first_name} ${data.technician.last_name}` : '',
    
    // Related data
    jobLines,
    inventoryItems,
    inventory_items: inventoryItems,
    timeEntries,
    
    // Additional fields for UI compatibility
    date: data.created_at,
    dueDate: data.end_time,
    due_date: data.end_time,
    priority: 'medium',
    location: '',
    notes: data.description || ''
  };

  return mappedWorkOrder;
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  console.log('Fetching work orders for customer:', customerId);
  
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customer:customers!work_orders_customer_id_fkey(id, first_name, last_name, email),
      vehicle:vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate),
      technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer work orders:', error);
    throw error;
  }

  return data?.map(wo => ({
    // Core work order fields
    id: wo.id,
    customer_id: wo.customer_id,
    vehicle_id: wo.vehicle_id,
    advisor_id: wo.advisor_id,
    technician_id: wo.technician_id,
    estimated_hours: wo.estimated_hours,
    total_cost: wo.total_cost,
    created_by: wo.created_by,
    created_at: wo.created_at,
    updated_at: wo.updated_at,
    start_time: wo.start_time,
    end_time: wo.end_time,
    service_category_id: wo.service_category_id,
    invoiced_at: wo.invoiced_at,
    status: wo.status,
    description: wo.description,
    service_type: wo.service_type,
    invoice_id: wo.invoice_id,
    work_order_number: wo.work_order_number,
    
    // Customer information as strings (for backward compatibility)
    customer: wo.customer ? `${wo.customer.first_name} ${wo.customer.last_name}` : '',
    customer_name: wo.customer ? `${wo.customer.first_name} ${wo.customer.last_name}` : '',
    customer_email: wo.customer?.email || '',
    customer_phone: wo.customer?.phone || '',
    
    // Vehicle information
    vehicle: wo.vehicle ? {
      id: wo.vehicle.id,
      year: wo.vehicle.year?.toString() || '',
      make: wo.vehicle.make || '',
      model: wo.vehicle.model || '',
      vin: wo.vehicle.vin || '',
      license_plate: wo.vehicle.license_plate || ''
    } : undefined,
    vehicle_make: wo.vehicle?.make || '',
    vehicle_model: wo.vehicle?.model || '',
    vehicle_year: wo.vehicle?.year?.toString() || '',
    vehicle_vin: wo.vehicle?.vin || '',
    vehicle_license_plate: wo.vehicle?.license_plate || '',
    
    // Technician information as string (for backward compatibility)
    technician: wo.technician ? `${wo.technician.first_name} ${wo.technician.last_name}` : '',
    
    // Additional fields for UI compatibility
    date: wo.created_at,
    dueDate: wo.end_time,
    due_date: wo.end_time,
    priority: 'medium',
    location: '',
    notes: wo.description || '',
    
    // Initialize empty arrays for related data
    jobLines: [],
    inventoryItems: [],
    inventory_items: [],
    timeEntries: []
  })) || [];
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  console.log('Fetching work orders by status:', status);
  
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customer:customers!work_orders_customer_id_fkey(id, first_name, last_name, email),
      vehicle:vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate),
      technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching work orders by status:', error);
    throw error;
  }

  return data?.map(wo => ({
    // Core work order fields
    id: wo.id,
    customer_id: wo.customer_id,
    vehicle_id: wo.vehicle_id,
    advisor_id: wo.advisor_id,
    technician_id: wo.technician_id,
    estimated_hours: wo.estimated_hours,
    total_cost: wo.total_cost,
    created_by: wo.created_by,
    created_at: wo.created_at,
    updated_at: wo.updated_at,
    start_time: wo.start_time,
    end_time: wo.end_time,
    service_category_id: wo.service_category_id,
    invoiced_at: wo.invoiced_at,
    status: wo.status,
    description: wo.description,
    service_type: wo.service_type,
    invoice_id: wo.invoice_id,
    work_order_number: wo.work_order_number,
    
    // Customer information as strings (for backward compatibility)
    customer: wo.customer ? `${wo.customer.first_name} ${wo.customer.last_name}` : '',
    customer_name: wo.customer ? `${wo.customer.first_name} ${wo.customer.last_name}` : '',
    customer_email: wo.customer?.email || '',
    customer_phone: wo.customer?.phone || '',
    
    // Vehicle information
    vehicle: wo.vehicle ? {
      id: wo.vehicle.id,
      year: wo.vehicle.year?.toString() || '',
      make: wo.vehicle.make || '',
      model: wo.vehicle.model || '',
      vin: wo.vehicle.vin || '',
      license_plate: wo.vehicle.license_plate || ''
    } : undefined,
    vehicle_make: wo.vehicle?.make || '',
    vehicle_model: wo.vehicle?.model || '',
    vehicle_year: wo.vehicle?.year?.toString() || '',
    vehicle_vin: wo.vehicle?.vin || '',
    vehicle_license_plate: wo.vehicle?.license_plate || '',
    
    // Technician information as string (for backward compatibility)
    technician: wo.technician ? `${wo.technician.first_name} ${wo.technician.last_name}` : '',
    
    // Additional fields for UI compatibility
    date: wo.created_at,
    dueDate: wo.end_time,
    due_date: wo.end_time,
    priority: 'medium',
    location: '',
    notes: wo.description || '',
    
    // Initialize empty arrays for related data
    jobLines: [],
    inventoryItems: [],
    inventory_items: [],
    timeEntries: []
  })) || [];
};

export const getUniqueTechnicians = async (): Promise<Array<{id: string; name: string}>> => {
  console.log('Fetching unique technicians...');
  
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      technician_id,
      technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email)
    `)
    .not('technician_id', 'is', null);

  if (error) {
    console.error('Error fetching technicians:', error);
    throw error;
  }

  // Create a map to ensure uniqueness
  const techniciansMap = new Map<string, {id: string; name: string}>();
  
  data?.forEach(wo => {
    if (wo.technician && wo.technician_id) {
      const techData = wo.technician as any;
      techniciansMap.set(wo.technician_id, {
        id: wo.technician_id,
        name: `${techData.first_name} ${techData.last_name}`
      });
    }
  });

  return Array.from(techniciansMap.values());
};
