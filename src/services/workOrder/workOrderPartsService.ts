
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

// Helper function to map database row to WorkOrderPart interface
function mapDbRowToPart(dbRow: any): WorkOrderPart {
  return {
    id: dbRow.id,
    work_order_id: dbRow.work_order_id,
    job_line_id: dbRow.job_line_id,
    part_number: dbRow.part_number,
    name: dbRow.part_name || dbRow.name, // Map part_name to name
    description: dbRow.description,
    quantity: dbRow.quantity || 1,
    unit_price: dbRow.customer_price || dbRow.unit_price || 0, // Map customer_price to unit_price
    total_price: (dbRow.customer_price || dbRow.unit_price || 0) * (dbRow.quantity || 1),
    status: dbRow.status,
    notes: dbRow.notes,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
    
    // Additional properties from database
    partName: dbRow.part_name,
    partNumber: dbRow.part_number,
    supplierName: dbRow.supplier_name,
    supplierCost: dbRow.supplier_cost,
    supplierSuggestedRetailPrice: dbRow.supplier_suggested_retail_price,
    customerPrice: dbRow.customer_price,
    retailPrice: dbRow.retail_price,
    category: dbRow.category,
    warrantyDuration: dbRow.warranty_duration,
    warrantyExpiryDate: dbRow.warranty_expiry_date,
    binLocation: dbRow.bin_location,
    installDate: dbRow.install_date,
    dateAdded: dbRow.date_added,
    partType: dbRow.part_type,
    installedBy: dbRow.installed_by,
    markupPercentage: dbRow.markup_percentage,
    inventoryItemId: dbRow.inventory_item_id,
    coreChargeApplied: dbRow.core_charge_applied,
    coreChargeAmount: dbRow.core_charge_amount,
    isTaxable: dbRow.is_taxable,
    invoiceNumber: dbRow.invoice_number,
    poLine: dbRow.po_line,
    isStockItem: dbRow.is_stock_item,
    notesInternal: dbRow.notes_internal,
    attachments: dbRow.attachments,
    warehouseLocation: dbRow.warehouse_location,
    shelfLocation: dbRow.shelf_location,
    workOrderId: dbRow.work_order_id,
    jobLineId: dbRow.job_line_id
  };
}

// Helper function to map WorkOrderPart interface to database format
function mapPartToDbFormat(part: Partial<WorkOrderPart>) {
  return {
    work_order_id: part.work_order_id || part.workOrderId,
    job_line_id: part.job_line_id || part.jobLineId,
    part_number: part.part_number || part.partNumber,
    part_name: part.name || part.partName,
    description: part.description,
    quantity: part.quantity,
    customer_price: part.unit_price || part.customerPrice,
    status: part.status,
    notes: part.notes,
    supplier_name: part.supplierName,
    supplier_cost: part.supplierCost,
    supplier_suggested_retail_price: part.supplierSuggestedRetailPrice,
    retail_price: part.retailPrice,
    category: part.category,
    warranty_duration: part.warrantyDuration,
    warranty_expiry_date: part.warrantyExpiryDate,
    bin_location: part.binLocation,
    install_date: part.installDate,
    date_added: part.dateAdded,
    part_type: part.partType,
    installed_by: part.installedBy,
    markup_percentage: part.markupPercentage,
    inventory_item_id: part.inventoryItemId,
    core_charge_applied: part.coreChargeApplied,
    core_charge_amount: part.coreChargeAmount,
    is_taxable: part.isTaxable,
    invoice_number: part.invoiceNumber,
    po_line: part.poLine,
    is_stock_item: part.isStockItem,
    notes_internal: part.notesInternal,
    attachments: part.attachments,
    warehouse_location: part.warehouseLocation,
    shelf_location: part.shelfLocation
  };
}

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    return (data || []).map(mapDbRowToPart);
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    return (data || []).map(mapDbRowToPart);
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    const dbFormat = mapPartToDbFormat(partData);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        ...dbFormat,
        updated_at: new Date().toISOString()
      })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    return mapDbRowToPart(data);
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}

export async function createWorkOrderPart(partData: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderPart> {
  try {
    const dbFormat = mapPartToDbFormat(partData);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        ...dbFormat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    return mapDbRowToPart(data);
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}
