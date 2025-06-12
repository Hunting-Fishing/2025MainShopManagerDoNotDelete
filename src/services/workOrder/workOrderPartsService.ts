
import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Transform raw database data to WorkOrderPart interface
export function transformPartData(rawPart: any): WorkOrderPart {
  return {
    id: rawPart.id,
    work_order_id: rawPart.work_order_id,
    job_line_id: rawPart.job_line_id,
    part_number: rawPart.part_number,
    name: rawPart.part_name || rawPart.name || 'Unknown Part',
    description: rawPart.description,
    quantity: rawPart.quantity || 0,
    unit_price: rawPart.customer_price || rawPart.unit_price || 0,
    total_price: (rawPart.customer_price || rawPart.unit_price || 0) * (rawPart.quantity || 0),
    status: rawPart.status,
    notes: rawPart.notes,
    created_at: rawPart.created_at,
    updated_at: rawPart.updated_at,
    
    // Additional properties for backward compatibility
    partName: rawPart.part_name || rawPart.name,
    partNumber: rawPart.part_number,
    customerPrice: rawPart.customer_price,
    supplierName: rawPart.supplier_name,
    supplierCost: rawPart.supplier_cost,
    category: rawPart.category,
    warrantyDuration: rawPart.warranty_duration,
    binLocation: rawPart.bin_location,
    installDate: rawPart.install_date,
    dateAdded: rawPart.date_added,
    partType: rawPart.part_type,
    installedBy: rawPart.installed_by,
    markupPercentage: rawPart.markup_percentage,
    inventoryItemId: rawPart.inventory_item_id,
    coreChargeApplied: rawPart.core_charge_applied,
    coreChargeAmount: rawPart.core_charge_amount,
    isTaxable: rawPart.is_taxable,
    invoiceNumber: rawPart.invoice_number,
    poLine: rawPart.po_line,
    isStockItem: rawPart.is_stock_item,
    notesInternal: rawPart.notes_internal,
    attachments: rawPart.attachments,
    warehouseLocation: rawPart.warehouse_location,
    shelfLocation: rawPart.shelf_location
  };
}

// Get all parts for a work order
export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId);

  if (error) {
    console.error('Error fetching work order parts:', error);
    throw error;
  }

  return (data || []).map(transformPartData);
}

// Get parts for a specific job line
export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('job_line_id', jobLineId);

  if (error) {
    console.error('Error fetching job line parts:', error);
    throw error;
  }

  return (data || []).map(transformPartData);
}

// Create a new work order part
export async function createWorkOrderPart(partData: WorkOrderPartFormValues & { work_order_id: string }): Promise<WorkOrderPart> {
  const dbData = {
    work_order_id: partData.work_order_id,
    job_line_id: partData.job_line_id,
    part_number: partData.part_number,
    part_name: partData.name || partData.partName,
    description: partData.description,
    quantity: partData.quantity || 1,
    customer_price: partData.unit_price || partData.customerPrice || 0,
    status: partData.status || 'pending',
    notes: partData.notes,
    supplier_name: partData.supplierName,
    supplier_cost: partData.supplierCost,
    category: partData.category,
    warranty_duration: partData.warrantyDuration,
    bin_location: partData.binLocation,
    install_date: partData.installDate,
    part_type: partData.partType,
    installed_by: partData.installedBy,
    markup_percentage: partData.markupPercentage,
    inventory_item_id: partData.inventoryItemId,
    core_charge_applied: partData.coreChargeApplied,
    core_charge_amount: partData.coreChargeAmount,
    is_taxable: partData.isTaxable,
    invoice_number: partData.invoiceNumber,
    po_line: partData.poLine,
    is_stock_item: partData.isStockItem,
    notes_internal: partData.notesInternal,
    attachments: partData.attachments,
    warehouse_location: partData.warehouseLocation,
    shelf_location: partData.shelfLocation
  };

  const { data, error } = await supabase
    .from('work_order_parts')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error creating work order part:', error);
    throw error;
  }

  return transformPartData(data);
}

// Update an existing work order part
export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPartFormValues>): Promise<WorkOrderPart> {
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.part_name = updates.name;
  if (updates.partName !== undefined) dbUpdates.part_name = updates.partName;
  if (updates.part_number !== undefined) dbUpdates.part_number = updates.part_number;
  if (updates.partNumber !== undefined) dbUpdates.part_number = updates.partNumber;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
  if (updates.customerPrice !== undefined) dbUpdates.customer_price = updates.customerPrice;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.supplierName !== undefined) dbUpdates.supplier_name = updates.supplierName;
  if (updates.supplierCost !== undefined) dbUpdates.supplier_cost = updates.supplierCost;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.warrantyDuration !== undefined) dbUpdates.warranty_duration = updates.warrantyDuration;
  if (updates.binLocation !== undefined) dbUpdates.bin_location = updates.binLocation;
  if (updates.installDate !== undefined) dbUpdates.install_date = updates.installDate;
  if (updates.partType !== undefined) dbUpdates.part_type = updates.partType;
  if (updates.installedBy !== undefined) dbUpdates.installed_by = updates.installedBy;
  if (updates.markupPercentage !== undefined) dbUpdates.markup_percentage = updates.markupPercentage;
  if (updates.inventoryItemId !== undefined) dbUpdates.inventory_item_id = updates.inventoryItemId;
  if (updates.coreChargeApplied !== undefined) dbUpdates.core_charge_applied = updates.coreChargeApplied;
  if (updates.coreChargeAmount !== undefined) dbUpdates.core_charge_amount = updates.coreChargeAmount;
  if (updates.isTaxable !== undefined) dbUpdates.is_taxable = updates.isTaxable;
  if (updates.invoiceNumber !== undefined) dbUpdates.invoice_number = updates.invoiceNumber;
  if (updates.poLine !== undefined) dbUpdates.po_line = updates.poLine;
  if (updates.isStockItem !== undefined) dbUpdates.is_stock_item = updates.isStockItem;
  if (updates.notesInternal !== undefined) dbUpdates.notes_internal = updates.notesInternal;
  if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
  if (updates.warehouseLocation !== undefined) dbUpdates.warehouse_location = updates.warehouseLocation;
  if (updates.shelfLocation !== undefined) dbUpdates.shelf_location = updates.shelfLocation;

  const { data, error } = await supabase
    .from('work_order_parts')
    .update(dbUpdates)
    .eq('id', partId)
    .select()
    .single();

  if (error) {
    console.error('Error updating work order part:', error);
    throw error;
  }

  return transformPartData(data);
}

// Delete a work order part
export async function deleteWorkOrderPart(partId: string): Promise<void> {
  const { error } = await supabase
    .from('work_order_parts')
    .delete()
    .eq('id', partId);

  if (error) {
    console.error('Error deleting work order part:', error);
    throw error;
  }
}
