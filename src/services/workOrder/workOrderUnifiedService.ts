
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';

// ============================================================================
// WORK ORDERS - QUERY OPERATIONS
// ============================================================================

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  console.log('Fetching all work orders...');
  
  try {
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    console.log('Work orders fetched successfully:', workOrders?.length);
    return workOrders || [];

  } catch (error) {
    console.error('Exception in getAllWorkOrders:', error);
    throw error;
  }
}

export async function getWorkOrderById(workOrderId: string): Promise<WorkOrder> {
  console.log('Fetching work order by ID:', workOrderId);
  
  try {
    // First get the work order data
    const { data: workOrder, error: workOrderError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', workOrderId)
      .single();

    if (workOrderError) {
      console.error('Error fetching work order:', workOrderError);
      throw new Error(`Failed to fetch work order: ${workOrderError.message}`);
    }

    // Get customer data separately if customer_id exists
    let customerData = null;
    if (workOrder.customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('first_name, last_name, email, phone')
        .eq('id', workOrder.customer_id)
        .single();
      
      if (!customerError && customer) {
        customerData = customer;
      }
    }

    // Get vehicle data separately if vehicle_id exists
    let vehicleData = null;
    if (workOrder.vehicle_id) {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('make, model, year, license_plate, vin')
        .eq('id', workOrder.vehicle_id)
        .single();
      
      if (!vehicleError && vehicle) {
        vehicleData = vehicle;
      }
    }

    // Combine the data
    const enrichedWorkOrder: WorkOrder = {
      ...workOrder,
      // Add customer data
      customer_name: customerData ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() : workOrder.customer_name,
      customer_email: customerData?.email || workOrder.customer_email,
      customer_phone: customerData?.phone || workOrder.customer_phone,
      // Add vehicle data
      vehicle_make: vehicleData?.make || workOrder.vehicle_make,
      vehicle_model: vehicleData?.model || workOrder.vehicle_model,
      vehicle_year: vehicleData?.year || workOrder.vehicle_year,
      vehicle_license_plate: vehicleData?.license_plate || workOrder.vehicle_license_plate,
      vehicle_vin: vehicleData?.vin || workOrder.vehicle_vin,
    };

    console.log('Work order fetched successfully:', enrichedWorkOrder);
    return enrichedWorkOrder;

  } catch (error) {
    console.error('Exception in getWorkOrderById:', error);
    throw error;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  console.log('Fetching work orders for customer:', customerId);
  
  try {
    // First get work orders
    const { data: workOrders, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (workOrdersError) {
      console.error('Error fetching customer work orders:', workOrdersError);
      throw new Error(`Failed to fetch customer work orders: ${workOrdersError.message}`);
    }

    if (!workOrders || workOrders.length === 0) {
      return [];
    }

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('first_name, last_name, email, phone, address, city, state, postal_code')
      .eq('id', customerId)
      .single();

    // Enrich work orders with customer data
    const enrichedWorkOrders = workOrders.map(workOrder => ({
      ...workOrder,
      customer_name: customer && !customerError ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : workOrder.customer_name,
      customer_email: customer?.email || workOrder.customer_email,
      customer_phone: customer?.phone || workOrder.customer_phone,
      customer_address: customer?.address || workOrder.customer_address,
      customer_city: customer?.city || workOrder.customer_city,
      customer_state: customer?.state || workOrder.customer_state,
      customer_postal_code: customer?.postal_code || workOrder.customer_postal_code,
      // Add vehicle data if needed
      vehicle_make: workOrder.vehicle_make,
      vehicle_model: workOrder.vehicle_model,
      vehicle_year: workOrder.vehicle_year,
      vehicle_license_plate: workOrder.vehicle_license_plate,
      vehicle_vin: workOrder.vehicle_vin,
    }));

    console.log('Customer work orders fetched successfully:', enrichedWorkOrders.length);
    return enrichedWorkOrders;

  } catch (error) {
    console.error('Exception in getWorkOrdersByCustomerId:', error);
    throw error;
  }
}

// ============================================================================
// WORK ORDERS - MUTATION OPERATIONS
// ============================================================================

export async function createWorkOrder(formData: WorkOrderFormSchemaValues): Promise<WorkOrder> {
  console.log('Creating work order with data:', formData);
  
  try {
    const workOrderInsert = {
      customer_id: formData.customerId || null,
      vehicle_id: formData.vehicleId || null,
      technician_id: formData.technicianId || null,
      description: formData.description,
      status: formData.status,
      service_type: formData.priority,
    };

    console.log('Prepared work order insert:', workOrderInsert);

    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .insert(workOrderInsert)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating work order:', error);
      throw new Error(`Failed to create work order: ${error.message}`);
    }

    console.log('Work order created successfully:', workOrder);
    return workOrder;

  } catch (error) {
    console.error('Exception in createWorkOrder:', error);
    throw error;
  }
}

export async function updateWorkOrder(workOrderId: string, workOrderData: Partial<WorkOrderFormSchemaValues>): Promise<WorkOrder> {
  console.log('Updating work order:', workOrderId, 'with data:', workOrderData);
  
  try {
    const workOrderUpdate = {
      description: workOrderData.description,
      status: workOrderData.status,
      customer_id: workOrderData.customerId || null,
      vehicle_id: workOrderData.vehicleId || null,
      technician_id: workOrderData.technicianId || null,
      service_type: workOrderData.priority,
      updated_at: new Date().toISOString(),
    };

    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .update(workOrderUpdate)
      .eq('id', workOrderId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating work order:', error);
      throw new Error(`Failed to update work order: ${error.message}`);
    }

    console.log('Work order updated successfully:', workOrder);
    return workOrder;

  } catch (error) {
    console.error('Exception in updateWorkOrder:', error);
    throw error;
  }
}

export async function updateWorkOrderStatus(workOrderId: string, status: string): Promise<WorkOrder> {
  console.log('Updating work order status:', workOrderId, 'to:', status);
  
  try {
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', workOrderId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating work order status:', error);
      throw new Error(`Failed to update work order status: ${error.message}`);
    }

    console.log('Work order status updated successfully:', workOrder);
    return workOrder;

  } catch (error) {
    console.error('Exception in updateWorkOrderStatus:', error);
    throw error;
  }
}

export async function deleteWorkOrder(workOrderId: string): Promise<boolean> {
  console.log('Deleting work order:', workOrderId);
  
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', workOrderId);

    if (error) {
      console.error('Error deleting work order:', error);
      throw new Error(`Failed to delete work order: ${error.message}`);
    }

    console.log('Work order deleted successfully');
    return true;

  } catch (error) {
    console.error('Exception in deleteWorkOrder:', error);
    throw error;
  }
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
    name: dbPart.part_name || 'Unknown Part',
    description: dbPart.description || '',
    quantity: dbPart.quantity || 1,
    unit_price: dbPart.customer_price || 0,
    total_price: (dbPart.customer_price || 0) * (dbPart.quantity || 1),
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
  const { data, error } = await supabase
    .from('work_order_parts')
    .insert({
      work_order_id: workOrderId,
      job_line_id: partData.job_line_id,
      part_number: partData.part_number,
      part_name: partData.name,
      quantity: partData.quantity || 1,
      customer_price: partData.unit_price || 0,
      status: partData.status || 'pending',
      notes: partData.notes
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
      part_name: partData.name,
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
