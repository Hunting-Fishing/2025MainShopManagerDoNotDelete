
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderPart, WorkOrderPartFormValues } from "@/types/workOrderPart";

/**
 * Get all parts for a work order
 */
export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data?.map(item => ({
      id: item.id,
      workOrderId: item.work_order_id,
      jobLineId: item.job_line_id,
      inventoryItemId: item.inventory_item_id,
      partName: item.part_name,
      partNumber: item.part_number,
      supplierName: item.supplier_name,
      supplierCost: item.supplier_cost,
      supplierSuggestedRetailPrice: item.supplier_suggested_retail_price,
      markupPercentage: item.markup_percentage,
      retailPrice: item.retail_price,
      customerPrice: item.customer_price,
      quantity: item.quantity,
      partType: item.part_type,
      invoiceNumber: item.invoice_number,
      poLine: item.po_line,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      category: item.category,
      isTaxable: item.is_taxable || false,
      coreChargeAmount: item.core_charge_amount || 0,
      coreChargeApplied: item.core_charge_applied || false,
      warrantyDuration: item.warranty_duration,
      warrantyExpiryDate: item.warranty_expiry_date,
      installDate: item.install_date,
      installedBy: item.installed_by,
      status: item.status || 'ordered',
      isStockItem: item.is_stock_item || false,
      dateAdded: item.date_added || item.created_at,
      attachments: item.attachments || [],
      notesInternal: item.notes_internal,
      binLocation: item.bin_location,
      warehouseLocation: item.warehouse_location,
      shelfLocation: item.shelf_location
    })) || [];
  } catch (error) {
    console.error('Error fetching work order parts:', error);
    return [];
  }
};

/**
 * Save a part to a work order
 */
export const saveWorkOrderPart = async (
  workOrderId: string,
  partData: WorkOrderPartFormValues
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
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
        date_added: partData.dateAdded,
        attachments: partData.attachments,
        notes: partData.notes,
        notes_internal: partData.notesInternal,
        bin_location: partData.binLocation,
        warehouse_location: partData.warehouseLocation,
        shelf_location: partData.shelfLocation,
        invoice_number: partData.invoiceNumber,
        po_line: partData.poLine
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving work order part:', error);
    return false;
  }
};

/**
 * Update a work order part
 */
export const updateWorkOrderPart = async (
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<boolean> => {
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
        status: partData.status,
        is_stock_item: partData.isStockItem,
        notes: partData.notes,
        notes_internal: partData.notesInternal,
        bin_location: partData.binLocation,
        warehouse_location: partData.warehouseLocation,
        shelf_location: partData.shelfLocation
      })
      .eq('id', partId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating work order part:', error);
    return false;
  }
};

/**
 * Delete a work order part
 */
export const deleteWorkOrderPart = async (partId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting work order part:', error);
    return false;
  }
};
