import { supabase } from '@/lib/supabase';
import { WorkOrderPart } from '@/types/workOrderPart';

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
    supplierOrderRef: dbPart.supplier_order_ref,
    notesInternal: dbPart.notes_internal,
    attachments: dbPart.attachments,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location
  };
};

export async function getUnassignedParts(workOrderId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .is('job_line_id', null);

  if (error) {
    console.error('Error fetching unassigned parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}

export async function assignPartToJobLine(partId: string, jobLineId: string): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({ job_line_id: jobLineId })
    .eq('id', partId)
    .select('*')
    .single();

  if (error) {
    console.error('Error assigning part to job line:', error);
    throw error;
  }

  return mapDatabasePartToWorkOrderPart(data);
}

export async function unassignPart(partId: string): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({ job_line_id: null })
    .eq('id', partId)
    .select('*')
    .single();

  if (error) {
    console.error('Error unassigning part:', error);
    throw error;
  }

  return mapDatabasePartToWorkOrderPart(data);
}

export async function bulkAssignParts(partIds: string[], jobLineId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({ job_line_id: jobLineId })
    .in('id', partIds)
    .select('*');

  if (error) {
    console.error('Error bulk assigning parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}

export async function bulkUnassignParts(partIds: string[]): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({ job_line_id: null })
    .in('id', partIds)
    .select('*');

  if (error) {
    console.error('Error bulk unassigning parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}

export async function getPartsByJobLine(workOrderId: string, jobLineId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .eq('job_line_id', jobLineId);

  if (error) {
    console.error('Error fetching parts by job line:', error);
    throw error;
  }

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}
