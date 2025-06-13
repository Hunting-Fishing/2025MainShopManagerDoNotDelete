
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

// Helper function to map database row to WorkOrderPart interface
function mapDbRowToWorkOrderPart(row: any): WorkOrderPart {
  return {
    id: row.id,
    work_order_id: row.work_order_id,
    job_line_id: row.job_line_id,
    part_number: row.part_number || row.partNumber || '',
    name: row.part_name || row.name || '',
    description: row.description || '',
    quantity: row.quantity || 0,
    unit_price: row.customer_price || row.unit_price || 0,
    total_price: (row.customer_price || row.unit_price || 0) * (row.quantity || 0),
    status: row.status || 'pending',
    notes: row.notes || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
    // Additional properties
    partName: row.part_name || row.name,
    partNumber: row.part_number,
    supplierName: row.supplier_name,
    supplierCost: row.supplier_cost,
    supplierSuggestedRetailPrice: row.supplier_suggested_retail_price,
    customerPrice: row.customer_price,
    retailPrice: row.retail_price,
    category: row.category,
    warrantyDuration: row.warranty_duration,
    warrantyExpiryDate: row.warranty_expiry_date,
    binLocation: row.bin_location,
    installDate: row.install_date,
    dateAdded: row.date_added || row.created_at,
    partType: row.part_type,
    installedBy: row.installed_by,
    markupPercentage: row.markup_percentage,
    inventoryItemId: row.inventory_item_id,
    coreChargeApplied: row.core_charge_applied,
    coreChargeAmount: row.core_charge_amount,
    isTaxable: row.is_taxable,
    invoiceNumber: row.invoice_number,
    poLine: row.po_line,
    isStockItem: row.is_stock_item,
    notesInternal: row.notes_internal,
    attachments: row.attachments,
    warehouseLocation: row.warehouse_location,
    shelfLocation: row.shelf_location
  };
}

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw new Error(`Failed to fetch work order parts: ${error.message}`);
    }

    return (data || []).map(mapDbRowToWorkOrderPart);
  } catch (error) {
    console.error('Exception in getWorkOrderParts:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw new Error(`Failed to fetch job line parts: ${error.message}`);
    }

    return (data || []).map(mapDbRowToWorkOrderPart);
  } catch (error) {
    console.error('Exception in getJobLineParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(partData: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderPart> {
  try {
    // Map WorkOrderPart interface to database schema
    const dbData = {
      work_order_id: partData.work_order_id,
      job_line_id: partData.job_line_id,
      part_number: partData.part_number,
      part_name: partData.name,
      description: partData.description,
      quantity: partData.quantity,
      customer_price: partData.unit_price,
      status: partData.status,
      notes: partData.notes,
      supplier_name: partData.supplierName,
      supplier_cost: partData.supplierCost,
      supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice,
      retail_price: partData.retailPrice,
      category: partData.category,
      warranty_duration: partData.warrantyDuration,
      warranty_expiry_date: partData.warrantyExpiryDate,
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
      .select('*')
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw new Error(`Failed to create work order part: ${error.message}`);
    }

    return mapDbRowToWorkOrderPart(data);
  } catch (error) {
    console.error('Exception in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    // Map WorkOrderPart interface to database schema
    const dbUpdates: any = {};
    
    if (updates.part_number !== undefined) dbUpdates.part_number = updates.part_number;
    if (updates.name !== undefined) dbUpdates.part_name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.supplierName !== undefined) dbUpdates.supplier_name = updates.supplierName;
    if (updates.supplierCost !== undefined) dbUpdates.supplier_cost = updates.supplierCost;
    if (updates.supplierSuggestedRetailPrice !== undefined) dbUpdates.supplier_suggested_retail_price = updates.supplierSuggestedRetailPrice;
    if (updates.retailPrice !== undefined) dbUpdates.retail_price = updates.retailPrice;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(dbUpdates)
      .eq('id', partId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw new Error(`Failed to update work order part: ${error.message}`);
    }

    return mapDbRowToWorkOrderPart(data);
  } catch (error) {
    console.error('Exception in updateWorkOrderPart:', error);
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
      throw new Error(`Failed to delete work order part: ${error.message}`);
    }
  } catch (error) {
    console.error('Exception in deleteWorkOrderPart:', error);
    throw error;
  }
}
