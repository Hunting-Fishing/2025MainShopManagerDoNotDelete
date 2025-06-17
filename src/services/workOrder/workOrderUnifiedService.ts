
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Customer } from '@/types/customer';

// ============================================================================
// CORE WORK ORDER FUNCTIONS
// ============================================================================

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch customer and vehicle data for each work order
    const workOrdersWithDetails = await Promise.all(
      (data || []).map(async (wo) => {
        const mappedWO = await enrichWorkOrderWithDetails(wo);
        return mappedWO;
      })
    );

    return workOrdersWithDetails;
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return [];
  }
}

export async function getWorkOrderById(workOrderId: string): Promise<WorkOrder | null> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', workOrderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Work order not found
      }
      throw error;
    }

    if (!data) return null;

    // Enrich with customer and vehicle details
    const enrichedWorkOrder = await enrichWorkOrderWithDetails(data);
    return enrichedWorkOrder;
  } catch (error) {
    console.error('Error fetching work order:', error);
    return null;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with customer and vehicle details
    const workOrdersWithDetails = await Promise.all(
      (data || []).map(async (wo) => {
        const mappedWO = await enrichWorkOrderWithDetails(wo);
        return mappedWO;
      })
    );

    return workOrdersWithDetails;
  } catch (error) {
    console.error('Error fetching work orders by customer:', error);
    return [];
  }
}

// Helper function to enrich work order with customer and vehicle details
async function enrichWorkOrderWithDetails(workOrder: any): Promise<WorkOrder> {
  let customer = null;
  let vehicle = null;

  // Fetch customer details if customer_id exists
  if (workOrder.customer_id) {
    try {
      const { data: customerData } = await supabase
        .from('customers')
        .select('first_name, last_name, email, phone, address, city, state, postal_code')
        .eq('id', workOrder.customer_id)
        .single();
      
      customer = customerData;
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  }

  // Fetch vehicle details if vehicle_id exists
  if (workOrder.vehicle_id) {
    try {
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('make, model, year, license_plate, vin')
        .eq('id', workOrder.vehicle_id)
        .single();
      
      vehicle = vehicleData;
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  }

  return {
    ...workOrder,
    // Customer fields
    customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
    customer_email: customer?.email,
    customer_phone: customer?.phone,
    customer_address: customer?.address,
    customer_city: customer?.city,
    customer_state: customer?.state,
    customer_postal_code: customer?.postal_code,
    // Vehicle fields
    vehicle_make: vehicle?.make,
    vehicle_model: vehicle?.model,
    vehicle_year: vehicle?.year?.toString(),
    vehicle_license_plate: vehicle?.license_plate,
    vehicle_vin: vehicle?.vin,
  };
}

export async function createWorkOrder(workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
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

  // Enrich with customer and vehicle details
  const enrichedWorkOrder = await enrichWorkOrderWithDetails(data);
  return enrichedWorkOrder;
}

export async function updateWorkOrder(workOrderId: string, workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
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
    .eq('id', workOrderId)
    .select()
    .single();

  if (error) throw error;

  // Enrich with customer and vehicle details
  const enrichedWorkOrder = await enrichWorkOrderWithDetails(data);
  return enrichedWorkOrder;
}

export async function updateWorkOrderStatus(workOrderId: string, status: string): Promise<WorkOrder> {
  const { data, error } = await supabase
    .from('work_orders')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', workOrderId)
    .select()
    .single();

  if (error) throw error;

  // Enrich with customer and vehicle details
  const enrichedWorkOrder = await enrichWorkOrderWithDetails(data);
  return enrichedWorkOrder;
}

export async function deleteWorkOrder(workOrderId: string): Promise<void> {
  const { error } = await supabase
    .from('work_orders')
    .delete()
    .eq('id', workOrderId);

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

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

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
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(mapDatabasePartToWorkOrderPart) || [];
  } catch (error) {
    console.error('Error fetching job line parts:', error);
    return [];
  }
}

export async function createWorkOrderPart(workOrderId: string, partData: any): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .insert({
      work_order_id: workOrderId,
      job_line_id: partData.job_line_id,
      part_number: partData.part_number || '',
      part_name: partData.name || partData.part_name || '',
      quantity: partData.quantity || 1,
      customer_price: partData.unit_price || partData.customer_price || 0,
      status: partData.status || 'pending',
      notes: partData.notes || '',
      part_type: partData.part_type || 'OEM'
    })
    .select()
    .single();

  if (error) throw error;
  return mapDatabasePartToWorkOrderPart(data);
}

export async function updateWorkOrderPart(partId: string, partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({
      job_line_id: partData.job_line_id,
      part_number: partData.part_number,
      part_name: partData.name || partData.partName,
      quantity: partData.quantity,
      customer_price: partData.unit_price || partData.customerPrice,
      status: partData.status,
      notes: partData.notes,
      part_type: partData.partType || 'OEM',
      updated_at: new Date().toISOString()
    })
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
