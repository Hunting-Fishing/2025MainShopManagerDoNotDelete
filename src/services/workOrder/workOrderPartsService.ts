
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Helper function to map database row to WorkOrderPart
function mapDatabaseRowToPart(row: any): WorkOrderPart {
  return {
    id: row.id,
    workOrderId: row.work_order_id,
    jobLineId: row.job_line_id,
    inventoryItemId: row.inventory_item_id,
    partName: row.part_name,
    partNumber: row.part_number,
    supplierName: row.supplier_name,
    supplierCost: row.supplier_cost || 0,
    supplierSuggestedRetailPrice: row.supplier_suggested_retail_price,
    markupPercentage: row.markup_percentage || 0,
    retailPrice: row.retail_price || 0,
    customerPrice: row.customer_price || 0,
    quantity: row.quantity || 1,
    partType: row.part_type,
    invoiceNumber: row.invoice_number,
    poLine: row.po_line,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    category: row.category,
    isTaxable: row.is_taxable || false,
    coreChargeAmount: row.core_charge_amount || 0,
    coreChargeApplied: row.core_charge_applied || false,
    warrantyDuration: row.warranty_duration,
    warrantyExpiryDate: row.warranty_expiry_date,
    installDate: row.install_date,
    installedBy: row.installed_by,
    status: row.status,
    isStockItem: row.is_stock_item || false,
    dateAdded: row.date_added || row.created_at,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    notesInternal: row.notes_internal,
    binLocation: row.bin_location,
    warehouseLocation: row.warehouse_location,
    shelfLocation: row.shelf_location
  };
}

export const getJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId);

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    return (data || []).map(mapDatabaseRowToPart);
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
};

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId);

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    return (data || []).map(mapDatabaseRowToPart);
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
};

export const addWorkOrderPart = async (
  workOrderId: string,
  jobLineId: string | undefined,
  partData: WorkOrderPartFormValues
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert([
        {
          work_order_id: workOrderId,
          job_line_id: jobLineId,
          inventory_item_id: partData.inventoryItemId,
          part_name: partData.partName,
          part_number: partData.partNumber,
          supplier_name: partData.supplierName,
          supplier_cost: partData.supplierCost,
          supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice,
          markup_percentage: partData.markupPercentage,
          retail_price: partData.retailPrice,
          customer_price: partData.customerPrice,
          quantity: partData.quantity,
          part_type: partData.partType,
          category: partData.category,
          is_taxable: partData.isTaxable,
          core_charge_amount: partData.coreChargeAmount,
          core_charge_applied: partData.coreChargeApplied,
          warranty_duration: partData.warrantyDuration,
          install_date: partData.installDate,
          installed_by: partData.installedBy,
          status: partData.status,
          is_stock_item: partData.isStockItem,
          invoice_number: partData.invoiceNumber,
          po_line: partData.poLine,
          notes: partData.notes,
          notes_internal: partData.notesInternal,
          bin_location: partData.binLocation,
          warehouse_location: partData.warehouseLocation,
          shelf_location: partData.shelfLocation,
          attachments: partData.attachments || []
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding work order part:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Error in addWorkOrderPart:', error);
    throw error;
  }
};

export const saveWorkOrderPart = addWorkOrderPart;

export const saveMultipleWorkOrderParts = async (
  workOrderId: string,
  jobLineId: string | undefined,
  parts: WorkOrderPartFormValues[]
): Promise<void> => {
  console.log('Saving multiple work order parts:', { workOrderId, jobLineId, parts });
  
  for (const part of parts) {
    await addWorkOrderPart(workOrderId, jobLineId, part);
  }
};

export const updateWorkOrderPart = async (
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .update({
        part_name: partData.partName,
        part_number: partData.partNumber,
        supplier_name: partData.supplierName,
        supplier_cost: partData.supplierCost,
        supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice,
        markup_percentage: partData.markupPercentage,
        retail_price: partData.retailPrice,
        customer_price: partData.customerPrice,
        quantity: partData.quantity,
        part_type: partData.partType,
        category: partData.category,
        is_taxable: partData.isTaxable,
        core_charge_amount: partData.coreChargeAmount,
        core_charge_applied: partData.coreChargeApplied,
        warranty_duration: partData.warrantyDuration,
        install_date: partData.installDate,
        installed_by: partData.installedBy,
        status: partData.status,
        is_stock_item: partData.isStockItem,
        invoice_number: partData.invoiceNumber,
        po_line: partData.poLine,
        notes: partData.notes,
        notes_internal: partData.notesInternal,
        bin_location: partData.binLocation,
        warehouse_location: partData.warehouseLocation,
        shelf_location: partData.shelfLocation,
        attachments: partData.attachments
      })
      .eq('id', partId);

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
};

export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
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
};
