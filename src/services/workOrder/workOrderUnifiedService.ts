
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";
import { Customer } from "@/types/customer";

// ============================================================================
// WORK ORDERS
// ============================================================================

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
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
        make,
        model,
        year,
        license_plate,
        vin
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data?.map(wo => ({
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
    // Customer fields
    customer_name: wo.customers ? `${wo.customers.first_name} ${wo.customers.last_name}` : '',
    customer_email: wo.customers?.email,
    customer_phone: wo.customers?.phone,
    // Vehicle fields
    vehicle_make: wo.vehicles?.make,
    vehicle_model: wo.vehicles?.model,
    vehicle_year: wo.vehicles?.year?.toString(),
    vehicle_license_plate: wo.vehicles?.license_plate,
    vehicle_vin: wo.vehicles?.vin,
  })) || [];
}

export async function getWorkOrderById(id: string): Promise<WorkOrder> {
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
        postal_code
      ),
      vehicles (
        id,
        make,
        model,
        year,
        license_plate,
        vin
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Work order not found');

  return {
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
    // Customer fields
    customer_name: data.customers ? `${data.customers.first_name} ${data.customers.last_name}` : '',
    customer_email: data.customers?.email,
    customer_phone: data.customers?.phone,
    customer_address: data.customers?.address,
    customer_city: data.customers?.city,
    customer_state: data.customers?.state,
    customer_postal_code: data.customers?.postal_code,
    // Vehicle fields - removed odometer since it doesn't exist in the vehicles table
    vehicle_make: data.vehicles?.make,
    vehicle_model: data.vehicles?.model,
    vehicle_year: data.vehicles?.year?.toString(),
    vehicle_license_plate: data.vehicles?.license_plate,
    vehicle_vin: data.vehicles?.vin,
  };
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  const { data, error } = await supabase
    .from('work_orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createWorkOrder(workOrderData: any): Promise<WorkOrder> {
  const { data, error } = await supabase
    .from('work_orders')
    .insert({
      customer_id: workOrderData.customer_id,
      vehicle_id: workOrderData.vehicle_id,
      advisor_id: workOrderData.advisor_id,
      technician_id: workOrderData.technician_id,
      estimated_hours: workOrderData.estimated_hours,
      total_cost: workOrderData.total_cost,
      created_by: workOrderData.created_by,
      start_time: workOrderData.start_time,
      end_time: workOrderData.end_time,
      service_category_id: workOrderData.service_category_id,
      status: workOrderData.status || 'pending',
      description: workOrderData.description,
      service_type: workOrderData.service_type,
      invoice_id: workOrderData.invoice_id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkOrder(id: string, workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
  const { data, error } = await supabase
    .from('work_orders')
    .update({
      customer_id: workOrderData.customer_id,
      vehicle_id: workOrderData.vehicle_id,
      advisor_id: workOrderData.advisor_id,
      technician_id: workOrderData.technician_id,
      estimated_hours: workOrderData.estimated_hours,
      total_cost: workOrderData.total_cost,
      start_time: workOrderData.start_time,
      end_time: workOrderData.end_time,
      service_category_id: workOrderData.service_category_id,
      status: workOrderData.status,
      description: workOrderData.description,
      service_type: workOrderData.service_type,
      invoice_id: workOrderData.invoice_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkOrderStatus(id: string, status: string): Promise<WorkOrder> {
  const { data, error } = await supabase
    .from('work_orders')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from('work_orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// JOB LINES
// ============================================================================

export async function getWorkOrderJobLines(workOrderId: string): Promise<WorkOrderJobLine[]> {
  const { data, error } = await supabase
    .from('work_order_job_lines')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createWorkOrderJobLine(workOrderId: string, jobLineData: any): Promise<WorkOrderJobLine> {
  const { data, error } = await supabase
    .from('work_order_job_lines')
    .insert({
      work_order_id: workOrderId,
      name: jobLineData.name,
      category: jobLineData.category,
      subcategory: jobLineData.subcategory,
      description: jobLineData.description,
      estimated_hours: jobLineData.estimated_hours || 0,
      labor_rate: jobLineData.labor_rate || 0,
      total_amount: jobLineData.total_amount || 0,
      status: jobLineData.status || 'pending',
      notes: jobLineData.notes,
      display_order: jobLineData.display_order || 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkOrderJobLine(jobLineId: string, jobLineData: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
  const { data, error } = await supabase
    .from('work_order_job_lines')
    .update({
      name: jobLineData.name,
      category: jobLineData.category,
      subcategory: jobLineData.subcategory,
      description: jobLineData.description,
      estimated_hours: jobLineData.estimated_hours,
      labor_rate: jobLineData.labor_rate,
      total_amount: jobLineData.total_amount,
      status: jobLineData.status,
      notes: jobLineData.notes,
      display_order: jobLineData.display_order,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobLineId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkOrderJobLine(jobLineId: string): Promise<void> {
  const { error } = await supabase
    .from('work_order_job_lines')
    .delete()
    .eq('id', jobLineId);

  if (error) throw error;
}

// ============================================================================
// PARTS
// ============================================================================

// Map database parts to our interface
const mapDatabasePartToWorkOrderPart = (dbPart: any): WorkOrderPart => {
  return {
    id: dbPart.id,
    work_order_id: dbPart.work_order_id,
    job_line_id: dbPart.job_line_id,
    part_number: dbPart.part_number || '',
    name: dbPart.part_name || dbPart.name || 'Unknown Part',
    description: dbPart.description || '',
    quantity: dbPart.quantity || 1,
    unit_price: dbPart.customer_price || dbPart.unit_price || 0,
    total_price: (dbPart.customer_price || dbPart.unit_price || 0) * (dbPart.quantity || 1),
    status: dbPart.status || 'pending',
    notes: dbPart.notes || '',
    created_at: dbPart.created_at || new Date().toISOString(),
    updated_at: dbPart.updated_at || new Date().toISOString(),
    // Map additional fields
    category: dbPart.category,
    supplierName: dbPart.supplier_name,
    supplierCost: dbPart.supplier_cost,
    customerPrice: dbPart.customer_price,
    retailPrice: dbPart.retail_price,
    partType: dbPart.part_type,
    markupPercentage: dbPart.markup_percentage,
    isTaxable: dbPart.is_taxable,
    coreChargeAmount: dbPart.core_charge_amount,
    coreChargeApplied: dbPart.core_charge_applied,
    warrantyDuration: dbPart.warranty_duration,
    invoiceNumber: dbPart.invoice_number,
    isStockItem: dbPart.is_stock_item,
    notesInternal: dbPart.notes_internal,
    binLocation: dbPart.bin_location,
    installDate: dbPart.install_date,
    installedBy: dbPart.installed_by,
    inventoryItemId: dbPart.inventory_item_id,
    attachments: dbPart.attachments,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location
  };
};

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId);

    if (error) throw error;

    return data?.map(mapDatabasePartToWorkOrderPart) || [];
  } catch (error) {
    console.error('Error fetching work order parts:', error);
    return [];
  }
};

export const getJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId);

    if (error) throw error;

    return data?.map(mapDatabasePartToWorkOrderPart) || [];
  } catch (error) {
    console.error('Error fetching job line parts:', error);
    return [];
  }
};

export const createWorkOrderPart = async (workOrderId: string, partData: any): Promise<WorkOrderPart> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number,
        part_name: partData.name,
        description: partData.description,
        quantity: partData.quantity || 1,
        customer_price: partData.unit_price || 0,
        status: partData.status || 'pending',
        notes: partData.notes
      })
      .select()
      .single();

    if (error) throw error;
    return mapDatabasePartToWorkOrderPart(data);
  } catch (error) {
    console.error('Error creating work order part:', error);
    throw error;
  }
};

export const updateWorkOrderPart = async (partId: string, partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        job_line_id: partData.job_line_id,
        part_number: partData.part_number,
        part_name: partData.name,
        description: partData.description,
        quantity: partData.quantity,
        customer_price: partData.unit_price,
        status: partData.status,
        notes: partData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', partId)
      .select()
      .single();

    if (error) throw error;
    return mapDatabasePartToWorkOrderPart(data);
  } catch (error) {
    console.error('Error updating work order part:', error);
    throw error;
  }
};

export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting work order part:', error);
    throw error;
  }
};

// ============================================================================
// TIME TRACKING
// ============================================================================

export async function getWorkOrderTimeEntries(workOrderId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('work_order_time_entries')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addTimeEntryToWorkOrder(workOrderId: string, timeEntryData: any): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('work_order_time_entries')
    .insert({
      work_order_id: workOrderId,
      employee_id: timeEntryData.employee_id,
      employee_name: timeEntryData.employee_name,
      start_time: timeEntryData.start_time,
      end_time: timeEntryData.end_time,
      duration: timeEntryData.duration,
      notes: timeEntryData.notes,
      billable: timeEntryData.billable || true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTimeEntry(timeEntryId: string, timeEntryData: Partial<TimeEntry>): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('work_order_time_entries')
    .update({
      employee_id: timeEntryData.employee_id,
      employee_name: timeEntryData.employee_name,
      start_time: timeEntryData.start_time,
      end_time: timeEntryData.end_time,
      duration: timeEntryData.duration,
      notes: timeEntryData.notes,
      billable: timeEntryData.billable
    })
    .eq('id', timeEntryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTimeEntry(timeEntryId: string): Promise<void> {
  const { error } = await supabase
    .from('work_order_time_entries')
    .delete()
    .eq('id', timeEntryId);

  if (error) throw error;
}

// Get unique technicians for filtering
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) throw error;

    const uniqueTechnicians = [...new Set(data?.map(wo => wo.technician_id).filter(Boolean))];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error fetching unique technicians:', error);
    return [];
  }
};
