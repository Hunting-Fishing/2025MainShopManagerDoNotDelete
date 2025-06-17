import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';

// ============================================================================
// WORK ORDER QUERIES
// ============================================================================

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  console.log('Fetching all work orders...');
  
  const { data: workOrders, error } = await supabase
    .from('work_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching work orders:', error);
    throw new Error(`Failed to fetch work orders: ${error.message}`);
  }

  return workOrders || [];
}

export async function getWorkOrderById(workOrderId: string): Promise<WorkOrder> {
  console.log('Fetching work order by ID:', workOrderId);
  
  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single();

  if (error) {
    console.error('Error fetching work order:', error);
    throw new Error(`Failed to fetch work order: ${error.message}`);
  }

  return workOrder;
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  const { data: workOrders, error } = await supabase
    .from('work_orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch customer work orders: ${error.message}`);
  return workOrders || [];
}

// ============================================================================
// WORK ORDER MUTATIONS
// ============================================================================

export async function createWorkOrder(formData: WorkOrderFormSchemaValues): Promise<WorkOrder> {
  console.log('Creating work order with data:', formData);
  
  const workOrderInsert = {
    customer_id: formData.customerId || null,
    vehicle_id: formData.vehicleId || null,
    technician_id: formData.technicianId || null,
    description: formData.description,
    status: formData.status,
    service_type: formData.priority,
  };

  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .insert(workOrderInsert)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create work order: ${error.message}`);
  return workOrder;
}

export async function updateWorkOrder(workOrderId: string, workOrderData: Partial<WorkOrderFormSchemaValues>): Promise<WorkOrder> {
  const workOrderUpdate = {
    description: workOrderData.description,
    status: workOrderData.status,
    customer_id: workOrderData.customerId || null,
    vehicle_id: workOrderData.vehicleId || null,
    technician_id: workOrderData.technicianId || null,
    customer_name: workOrderData.customer,
    customer_email: workOrderData.customerEmail || null,
    customer_phone: workOrderData.customerPhone || null,
    customer_address: workOrderData.customerAddress || null,
    vehicle_make: workOrderData.vehicleMake || null,
    vehicle_model: workOrderData.vehicleModel || null,
    vehicle_year: workOrderData.vehicleYear || null,
    vehicle_license_plate: workOrderData.licensePlate || null,
    vehicle_vin: workOrderData.vin || null,
    notes: workOrderData.notes || null,
    due_date: workOrderData.dueDate ? new Date(workOrderData.dueDate).toISOString() : null,
    priority: workOrderData.priority,
    location: workOrderData.location || null,
    updated_at: new Date().toISOString(),
  };

  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .update(workOrderUpdate)
    .eq('id', workOrderId)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to update work order: ${error.message}`);
  return workOrder;
}

export async function updateWorkOrderStatus(workOrderId: string, status: string): Promise<WorkOrder> {
  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', workOrderId)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to update work order status: ${error.message}`);
  return workOrder;
}

export async function deleteWorkOrder(workOrderId: string): Promise<boolean> {
  const { error } = await supabase
    .from('work_orders')
    .delete()
    .eq('id', workOrderId);

  if (error) throw new Error(`Failed to delete work order: ${error.message}`);
  return true;
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
      labor_rate_type: jobLineData.labor_rate_type || 'standard',
      total_amount: (jobLineData.estimated_hours || 0) * (jobLineData.labor_rate || 0),
      status: jobLineData.status || 'pending',
      notes: jobLineData.notes,
      display_order: 0
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
      labor_rate_type: jobLineData.labor_rate_type,
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

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('job_line_id', jobLineId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createWorkOrderPart(workOrderId: string, partData: any): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .insert({
      work_order_id: workOrderId,
      job_line_id: partData.job_line_id,
      part_number: partData.part_number,
      name: partData.name,
      description: partData.description,
      quantity: partData.quantity || 1,
      unit_price: partData.unit_price || 0,
      total_price: (partData.quantity || 1) * (partData.unit_price || 0),
      status: partData.status || 'pending',
      notes: partData.notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkOrderPart(partId: string, partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({
      job_line_id: partData.job_line_id,
      part_number: partData.part_number,
      name: partData.name,
      description: partData.description,
      quantity: partData.quantity,
      unit_price: partData.unit_price,
      total_price: partData.total_price,
      status: partData.status,
      notes: partData.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', partId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  const { error } = await supabase
    .from('work_order_parts')
    .delete()
    .eq('id', partId);

  if (error) throw error;
}

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

export const createWorkOrderPart = async (partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: partData.work_order_id!,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number || '',
        part_name: partData.name || '',
        description: partData.description || '',
        quantity: partData.quantity || 1,
        customer_price: partData.unit_price || 0,
        status: partData.status || 'pending',
        notes: partData.notes || ''
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

export const updateWorkOrderPart = async (partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        part_number: updates.part_number,
        part_name: updates.name,
        description: updates.description,
        quantity: updates.quantity,
        customer_price: updates.unit_price,
        status: updates.status,
        notes: updates.notes
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
