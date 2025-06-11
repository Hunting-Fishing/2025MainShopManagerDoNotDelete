
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Get all parts for a work order
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

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

// Get parts for a specific job line
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

    return data || [];
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}

// Save a new work order part
export async function saveWorkOrderPart(
  workOrderId: string, 
  partData: WorkOrderPartFormValues, 
  jobLineId?: string
): Promise<boolean> {
  try {
    const partRecord = {
      work_order_id: workOrderId,
      job_line_id: jobLineId || null,
      part_name: partData.partName,
      part_number: partData.partNumber || null,
      supplier_name: partData.supplierName || null,
      supplier_cost: partData.supplierCost,
      supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice || null,
      markup_percentage: partData.markupPercentage,
      retail_price: partData.retailPrice,
      customer_price: partData.customerPrice,
      quantity: partData.quantity,
      part_type: partData.partType,
      inventory_item_id: partData.inventoryItemId || null,
      invoice_number: partData.invoiceNumber || null,
      po_line: partData.poLine || null,
      notes: partData.notes || null,
      category: partData.category || null,
      is_taxable: partData.isTaxable,
      core_charge_amount: partData.coreChargeAmount,
      core_charge_applied: partData.coreChargeApplied,
      warranty_duration: partData.warrantyDuration || null,
      install_date: partData.installDate || null,
      installed_by: partData.installedBy || null,
      status: partData.status,
      is_stock_item: partData.isStockItem,
      notes_internal: partData.notesInternal || null,
      bin_location: partData.binLocation || null,
      warehouse_location: partData.warehouseLocation || null,
      shelf_location: partData.shelfLocation || null,
      attachments: partData.attachments || [],
      date_added: new Date().toISOString()
    };

    const { error } = await supabase
      .from('work_order_parts')
      .insert([partRecord]);

    if (error) {
      console.error('Error saving work order part:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in saveWorkOrderPart:', error);
    return false;
  }
}

// Update an existing work order part
export async function updateWorkOrderPart(
  partId: string, 
  partData: WorkOrderPartFormValues
): Promise<boolean> {
  try {
    const updateRecord = {
      part_name: partData.partName,
      part_number: partData.partNumber || null,
      supplier_name: partData.supplierName || null,
      supplier_cost: partData.supplierCost,
      supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice || null,
      markup_percentage: partData.markupPercentage,
      retail_price: partData.retailPrice,
      customer_price: partData.customerPrice,
      quantity: partData.quantity,
      part_type: partData.partType,
      invoice_number: partData.invoiceNumber || null,
      po_line: partData.poLine || null,
      notes: partData.notes || null,
      category: partData.category || null,
      is_taxable: partData.isTaxable,
      core_charge_amount: partData.coreChargeAmount,
      core_charge_applied: partData.coreChargeApplied,
      warranty_duration: partData.warrantyDuration || null,
      install_date: partData.installDate || null,
      installed_by: partData.installedBy || null,
      status: partData.status,
      is_stock_item: partData.isStockItem,
      notes_internal: partData.notesInternal || null,
      bin_location: partData.binLocation || null,
      warehouse_location: partData.warehouseLocation || null,
      shelf_location: partData.shelfLocation || null,
      attachments: partData.attachments || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('work_order_parts')
      .update(updateRecord)
      .eq('id', partId);

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    return false;
  }
}

// Delete a work order part
export async function deleteWorkOrderPart(partId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    return false;
  }
}
