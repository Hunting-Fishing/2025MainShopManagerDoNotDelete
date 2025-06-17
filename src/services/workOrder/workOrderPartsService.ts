
import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Helper function to map database response to WorkOrderPart
const mapDatabasePartToWorkOrderPart = (dbPart: any): WorkOrderPart => {
  return {
    id: dbPart.id,
    work_order_id: dbPart.work_order_id,
    job_line_id: dbPart.job_line_id,
    part_number: dbPart.part_number,
    name: dbPart.part_name || dbPart.name || '',
    description: dbPart.part_description || dbPart.description || '',
    quantity: dbPart.quantity || 0,
    unit_price: dbPart.customer_price || dbPart.unit_price || 0,
    total_price: (dbPart.customer_price || dbPart.unit_price || 0) * (dbPart.quantity || 0),
    status: dbPart.status || 'pending',
    notes: dbPart.notes_internal || dbPart.notes || '',
    created_at: dbPart.created_at,
    updated_at: dbPart.updated_at,
    
    // Additional properties with fallbacks
    partName: dbPart.part_name || dbPart.name,
    partNumber: dbPart.part_number,
    supplierName: dbPart.supplier_name,
    supplierCost: dbPart.supplier_cost,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
    customerPrice: dbPart.customer_price,
    retailPrice: dbPart.retail_price,
    category: dbPart.category,
    warrantyDuration: dbPart.warranty_duration,
    warrantyExpiryDate: dbPart.warranty_expiry_date,
    binLocation: dbPart.bin_location,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location,
    installDate: dbPart.install_date,
    dateAdded: dbPart.date_added || dbPart.created_at,
    partType: dbPart.part_type,
    installedBy: dbPart.installed_by,
    markupPercentage: dbPart.markup_percentage,
    inventoryItemId: dbPart.inventory_item_id,
    coreChargeApplied: dbPart.core_charge_applied,
    coreChargeAmount: dbPart.core_charge_amount,
    isTaxable: dbPart.is_taxable,
    invoiceNumber: dbPart.invoice_number,
    poLine: dbPart.po_line,
    isStockItem: dbPart.is_stock_item,
    supplierOrderRef: dbPart.supplier_order_ref,
    notesInternal: dbPart.notes_internal,
    attachments: dbPart.attachments
  };
};

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId);

  if (error) {
    console.error('Error fetching work order parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('job_line_id', jobLineId);

  if (error) {
    console.error('Error fetching job line parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}

export async function createWorkOrderPart(workOrderId: string, partData: WorkOrderPartFormValues): Promise<WorkOrderPart> {
  // Map form values to database fields
  const dbData = {
    work_order_id: workOrderId,
    job_line_id: partData.job_line_id,
    part_number: partData.part_number,
    part_name: partData.name, // Map name to part_name for database
    part_description: partData.description, // Map description to part_description for database
    quantity: partData.quantity,
    customer_price: partData.unit_price, // Map unit_price to customer_price for database
    status: partData.status,
    notes_internal: partData.notes, // Map notes to notes_internal for database
    category: partData.category,
    supplier_cost: partData.supplierCost,
    retail_price: partData.retailPrice,
    markup_percentage: partData.markupPercentage,
    is_taxable: partData.isTaxable,
    core_charge_amount: partData.coreChargeAmount,
    core_charge_applied: partData.coreChargeApplied,
    warranty_duration: partData.warrantyDuration,
    warranty_expiry_date: partData.warrantyExpiryDate,
    install_date: partData.installDate,
    installed_by: partData.installedBy,
    invoice_number: partData.invoiceNumber,
    po_line: partData.poLine,
    is_stock_item: partData.isStockItem,
    supplier_name: partData.supplierName,
    supplier_order_ref: partData.supplierOrderRef,
    inventory_item_id: partData.inventoryItemId,
    part_type: partData.partType,
    estimated_arrival_date: partData.estimatedArrivalDate,
    item_status: partData.itemStatus
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

  return mapDatabasePartToWorkOrderPart(data);
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPartFormValues>): Promise<WorkOrderPart> {
  // Map form field names to database field names
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.part_name = updates.name;
  if (updates.description !== undefined) dbUpdates.part_description = updates.description;
  if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
  if (updates.notes !== undefined) dbUpdates.notes_internal = updates.notes;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.part_number !== undefined) dbUpdates.part_number = updates.part_number;
  if (updates.job_line_id !== undefined) dbUpdates.job_line_id = updates.job_line_id;

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

  return mapDatabasePartToWorkOrderPart(data);
}

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
