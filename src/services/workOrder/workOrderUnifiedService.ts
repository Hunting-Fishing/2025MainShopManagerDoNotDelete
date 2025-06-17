
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';

// ============================================================================
// WORK ORDERS
// ============================================================================

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
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
        make,
        model,
        year,
        license_plate,
        vin
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(wo => ({
    ...wo,
    customer_name: wo.customers ? `${wo.customers.first_name} ${wo.customers.last_name}` : '',
    customer_email: wo.customers?.email || '',
    customer_phone: wo.customers?.phone || '',
    vehicle_make: wo.vehicles?.make || '',
    vehicle_model: wo.vehicles?.model || '',
    vehicle_year: wo.vehicles?.year?.toString() || '',
    vehicle_license_plate: wo.vehicles?.license_plate || '',
    vehicle_vin: wo.vehicles?.vin || ''
  }));
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customers!work_orders_customer_id_fkey (
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
      vehicles!work_orders_vehicle_id_fkey (
        id,
        make,
        model,
        year,
        license_plate,
        vin,
        odometer
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    customer_name: data.customers ? `${data.customers.first_name} ${data.customers.last_name}` : '',
    customer_email: data.customers?.email || '',
    customer_phone: data.customers?.phone || '',
    customer_address: data.customers?.address || '',
    customer_city: data.customers?.city || '',
    customer_state: data.customers?.state || '',
    customer_postal_code: data.customers?.postal_code || '',
    vehicle_make: data.vehicles?.make || '',
    vehicle_model: data.vehicles?.model || '',
    vehicle_year: data.vehicles?.year?.toString() || '',
    vehicle_license_plate: data.vehicles?.license_plate || '',
    vehicle_vin: data.vehicles?.vin || '',
    vehicle_odometer: data.vehicles?.odometer || ''
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

export async function createWorkOrder(workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
  const { data, error } = await supabase
    .from('work_orders')
    .insert({
      customer_id: workOrderData.customer_id,
      vehicle_id: workOrderData.vehicle_id,
      advisor_id: workOrderData.advisor_id,
      technician_id: workOrderData.technician_id,
      status: workOrderData.status || 'pending',
      description: workOrderData.description || '',
      service_type: workOrderData.service_type,
      estimated_hours: workOrderData.estimated_hours,
      total_cost: workOrderData.total_cost,
      start_time: workOrderData.start_time,
      end_time: workOrderData.end_time,
      service_category_id: workOrderData.service_category_id,
      created_by: workOrderData.created_by
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
      status: workOrderData.status,
      description: workOrderData.description,
      service_type: workOrderData.service_type,
      estimated_hours: workOrderData.estimated_hours,
      total_cost: workOrderData.total_cost,
      start_time: workOrderData.start_time,
      end_time: workOrderData.end_time,
      service_category_id: workOrderData.service_category_id,
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

export async function createWorkOrderJobLine(workOrderId: string, jobLineData: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
  const { data, error } = await supabase
    .from('work_order_job_lines')
    .insert({
      work_order_id: workOrderId,
      name: jobLineData.name || '',
      category: jobLineData.category,
      subcategory: jobLineData.subcategory,
      description: jobLineData.description,
      estimated_hours: jobLineData.estimated_hours || 0,
      labor_rate: jobLineData.labor_rate || 0,
      labor_rate_type: jobLineData.labor_rate_type || 'standard',
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

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
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
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
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
}

export async function createWorkOrderPart(workOrderId: string, partData: any): Promise<WorkOrderPart> {
  // Map our interface to database fields
  const dbPartData = {
    work_order_id: workOrderId,
    job_line_id: partData.job_line_id,
    part_number: partData.part_number,
    part_name: partData.name, // Map name to part_name for database
    description: partData.description,
    quantity: partData.quantity || 1,
    customer_price: partData.unit_price || 0, // Map unit_price to customer_price
    status: partData.status || 'pending',
    notes: partData.notes,
    category: partData.category,
    supplier_name: partData.supplierName,
    supplier_cost: partData.supplierCost,
    retail_price: partData.retailPrice,
    part_type: partData.partType,
    markup_percentage: partData.markupPercentage,
    is_taxable: partData.isTaxable,
    core_charge_amount: partData.coreChargeAmount,
    core_charge_applied: partData.coreChargeApplied,
    warranty_duration: partData.warrantyDuration,
    invoice_number: partData.invoiceNumber,
    is_stock_item: partData.isStockItem,
    notes_internal: partData.notesInternal,
    bin_location: partData.binLocation,
    install_date: partData.installDate,
    installed_by: partData.installedBy,
    inventory_item_id: partData.inventoryItemId,
    attachments: partData.attachments,
    warehouse_location: partData.warehouseLocation,
    shelf_location: partData.shelfLocation
  };

  const { data, error } = await supabase
    .from('work_order_parts')
    .insert(dbPartData)
    .select()
    .single();

  if (error) throw error;
  return mapDatabasePartToWorkOrderPart(data);
}

export async function updateWorkOrderPart(partId: string, partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  // Map our interface to database fields
  const dbPartData: any = {};
  
  if (partData.job_line_id !== undefined) dbPartData.job_line_id = partData.job_line_id;
  if (partData.part_number !== undefined) dbPartData.part_number = partData.part_number;
  if (partData.name !== undefined) dbPartData.part_name = partData.name;
  if (partData.description !== undefined) dbPartData.description = partData.description;
  if (partData.quantity !== undefined) dbPartData.quantity = partData.quantity;
  if (partData.unit_price !== undefined) dbPartData.customer_price = partData.unit_price;
  if (partData.status !== undefined) dbPartData.status = partData.status;
  if (partData.notes !== undefined) dbPartData.notes = partData.notes;
  if (partData.category !== undefined) dbPartData.category = partData.category;
  if (partData.supplierName !== undefined) dbPartData.supplier_name = partData.supplierName;
  if (partData.supplierCost !== undefined) dbPartData.supplier_cost = partData.supplierCost;
  if (partData.retailPrice !== undefined) dbPartData.retail_price = partData.retailPrice;
  if (partData.partType !== undefined) dbPartData.part_type = partData.partType;
  if (partData.markupPercentage !== undefined) dbPartData.markup_percentage = partData.markupPercentage;
  if (partData.isTaxable !== undefined) dbPartData.is_taxable = partData.isTaxable;
  if (partData.coreChargeAmount !== undefined) dbPartData.core_charge_amount = partData.coreChargeAmount;
  if (partData.coreChargeApplied !== undefined) dbPartData.core_charge_applied = partData.coreChargeApplied;
  if (partData.warrantyDuration !== undefined) dbPartData.warranty_duration = partData.warrantyDuration;
  if (partData.invoiceNumber !== undefined) dbPartData.invoice_number = partData.invoiceNumber;
  if (partData.isStockItem !== undefined) dbPartData.is_stock_item = partData.isStockItem;
  if (partData.notesInternal !== undefined) dbPartData.notes_internal = partData.notesInternal;
  if (partData.binLocation !== undefined) dbPartData.bin_location = partData.binLocation;
  if (partData.installDate !== undefined) dbPartData.install_date = partData.installDate;
  if (partData.installedBy !== undefined) dbPartData.installed_by = partData.installedBy;
  if (partData.inventoryItemId !== undefined) dbPartData.inventory_item_id = partData.inventoryItemId;
  if (partData.attachments !== undefined) dbPartData.attachments = partData.attachments;
  if (partData.warehouseLocation !== undefined) dbPartData.warehouse_location = partData.warehouseLocation;
  if (partData.shelfLocation !== undefined) dbPartData.shelf_location = partData.shelfLocation;

  dbPartData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('work_order_parts')
    .update(dbPartData)
    .eq('id', partId)
    .select()
    .single();

  if (error) throw error;
  return mapDatabasePartToWorkOrderPart(data);
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
