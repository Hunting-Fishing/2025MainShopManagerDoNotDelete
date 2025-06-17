
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
    notesInternal: dbPart.notes_internal,
    attachments: dbPart.attachments,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location,
    
    // CamelCase aliases
    workOrderId: dbPart.work_order_id,
    jobLineId: dbPart.job_line_id
  };
};

export async function createWorkOrderPart(partData: WorkOrderPartFormValues & { work_order_id: string; total_price: number }): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .insert({
      work_order_id: partData.work_order_id,
      job_line_id: partData.job_line_id || null,
      part_number: partData.part_number,
      part_name: partData.name,
      part_description: partData.description,
      quantity: partData.quantity,
      customer_price: partData.unit_price,
      status: partData.status || 'pending',
      notes_internal: partData.notes
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating work order part:', error);
    throw error;
  }

  return mapDatabasePartToWorkOrderPart(data);
}

export async function updateWorkOrderPart(partId: string, partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  const updateData: any = {};
  
  if (partData.job_line_id !== undefined) updateData.job_line_id = partData.job_line_id;
  if (partData.part_number) updateData.part_number = partData.part_number;
  if (partData.name) updateData.part_name = partData.name;
  if (partData.description !== undefined) updateData.part_description = partData.description;
  if (partData.quantity !== undefined) updateData.quantity = partData.quantity;
  if (partData.unit_price !== undefined) updateData.customer_price = partData.unit_price;
  if (partData.status) updateData.status = partData.status;
  if (partData.notes !== undefined) updateData.notes_internal = partData.notes;
  
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('work_order_parts')
    .update(updateData)
    .eq('id', partId)
    .select('*')
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
