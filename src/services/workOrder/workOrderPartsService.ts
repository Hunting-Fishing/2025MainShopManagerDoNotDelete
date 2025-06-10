
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

/**
 * Get all parts for a work order
 */
export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  try {
    console.log('Fetching parts for work order:', workOrderId);
    
    const { data, error } = await supabase.rpc('get_work_order_parts', {
      work_order_id_param: workOrderId
    });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    console.log('Fetched work order parts:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
};

/**
 * Get parts for a specific job line
 */
export const getJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
  try {
    console.log('Fetching parts for job line:', jobLineId);
    
    const { data, error } = await supabase.rpc('get_job_line_parts', {
      job_line_id_param: jobLineId
    });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    console.log('Fetched job line parts:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
};

/**
 * Save a single work order part
 */
export const saveWorkOrderPart = async (
  workOrderId: string,
  jobLineId: string | undefined,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> => {
  try {
    console.log('Saving work order part:', { workOrderId, jobLineId, partData });

    const { data, error } = await supabase.rpc('insert_work_order_part', {
      p_work_order_id: workOrderId,
      p_job_line_id: jobLineId || null,
      p_inventory_item_id: partData.inventoryItemId || null,
      p_part_name: partData.partName,
      p_part_number: partData.partNumber || null,
      p_supplier_name: partData.supplierName || null,
      p_supplier_cost: partData.supplierCost,
      p_supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice || null,
      p_markup_percentage: partData.markupPercentage,
      p_retail_price: partData.retailPrice,
      p_customer_price: partData.customerPrice,
      p_quantity: partData.quantity,
      p_part_type: partData.partType,
      p_invoice_number: partData.invoiceNumber || null,
      p_po_line: partData.poLine || null,
      p_notes: partData.notes || null,
      p_category: partData.category || null,
      p_is_taxable: partData.isTaxable,
      p_core_charge_amount: partData.coreChargeAmount,
      p_core_charge_applied: partData.coreChargeApplied,
      p_warranty_duration: partData.warrantyDuration || null,
      p_install_date: partData.installDate || null,
      p_installed_by: partData.installedBy || null,
      p_status: partData.status,
      p_is_stock_item: partData.isStockItem
    });

    if (error) {
      console.error('Error saving work order part:', error);
      throw error;
    }

    console.log('Work order part saved successfully:', data);
    
    // Fetch the complete part record
    const { data: partRecord, error: fetchError } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      console.error('Error fetching saved part:', fetchError);
      throw fetchError;
    }

    return partRecord;
  } catch (error) {
    console.error('Error in saveWorkOrderPart:', error);
    throw error;
  }
};

/**
 * Save multiple work order parts
 */
export const saveMultipleWorkOrderParts = async (
  workOrderId: string,
  jobLineId: string | undefined,
  parts: WorkOrderPartFormValues[]
): Promise<WorkOrderPart[]> => {
  try {
    console.log('Saving multiple work order parts:', { workOrderId, jobLineId, partsCount: parts.length });

    const savedParts: WorkOrderPart[] = [];

    for (const partData of parts) {
      const savedPart = await saveWorkOrderPart(workOrderId, jobLineId, partData);
      savedParts.push(savedPart);
    }

    console.log('All parts saved successfully:', savedParts);
    return savedParts;
  } catch (error) {
    console.error('Error in saveMultipleWorkOrderParts:', error);
    throw error;
  }
};

/**
 * Update a work order part
 */
export const updateWorkOrderPart = async (
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<WorkOrderPart> => {
  try {
    console.log('Updating work order part:', { partId, partData });

    const { data, error } = await supabase.rpc('update_work_order_part', {
      p_id: partId,
      p_part_name: partData.partName || '',
      p_part_number: partData.partNumber || null,
      p_supplier_name: partData.supplierName || null,
      p_supplier_cost: partData.supplierCost || 0,
      p_supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice || null,
      p_markup_percentage: partData.markupPercentage || 0,
      p_retail_price: partData.retailPrice || 0,
      p_customer_price: partData.customerPrice || 0,
      p_quantity: partData.quantity || 1,
      p_part_type: partData.partType || 'non-inventory',
      p_invoice_number: partData.invoiceNumber || null,
      p_po_line: partData.poLine || null,
      p_notes: partData.notes || null,
      p_category: partData.category || null,
      p_is_taxable: partData.isTaxable ?? true,
      p_core_charge_amount: partData.coreChargeAmount || 0,
      p_core_charge_applied: partData.coreChargeApplied || false,
      p_warranty_duration: partData.warrantyDuration || null,
      p_install_date: partData.installDate || null,
      p_installed_by: partData.installedBy || null,
      p_status: partData.status || null,
      p_is_stock_item: partData.isStockItem ?? true
    });

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    console.log('Work order part updated successfully:', data);
    
    // Fetch the updated part record
    const { data: partRecord, error: fetchError } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('id', partId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated part:', fetchError);
      throw fetchError;
    }

    return partRecord;
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
};

/**
 * Delete a work order part
 */
export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
  try {
    console.log('Deleting work order part:', partId);

    const { error } = await supabase.rpc('delete_work_order_part', {
      part_id_param: partId
    });

    if (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }

    console.log('Work order part deleted successfully:', partId);
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
};
