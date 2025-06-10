
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

    if (error) throw error;

    return (data || []).map((part: any): WorkOrderPart => ({
      id: part.id,
      workOrderId: part.work_order_id,
      jobLineId: part.job_line_id,
      inventoryItemId: part.inventory_item_id,
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
      markupPercentage: part.markup_percentage,
      retailPrice: part.retail_price,
      customerPrice: part.customer_price,
      quantity: part.quantity,
      partType: (part.part_type === 'inventory' || part.part_type === 'non-inventory') ? part.part_type : 'non-inventory',
      invoiceNumber: part.invoice_number,
      poLine: part.po_line,
      notes: part.notes,
      createdAt: part.created_at,
      updatedAt: part.updated_at,
      category: part.category,
      isTaxable: part.is_taxable,
      coreChargeAmount: part.core_charge_amount,
      coreChargeApplied: part.core_charge_applied,
      warrantyDuration: part.warranty_duration,
      warrantyExpiryDate: part.warranty_expiry_date,
      installDate: part.install_date,
      installedBy: part.installed_by,
      status: part.status,
      isStockItem: part.is_stock_item,
      dateAdded: part.date_added,
      attachments: part.attachments || [],
      notesInternal: part.notes_internal,
      binLocation: part.bin_location || '',
      warehouseLocation: part.warehouse_location || '',
      shelfLocation: part.shelf_location || '',
    }));
  } catch (error) {
    console.error('Error fetching work order parts:', error);
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

    if (error) throw error;

    return (data || []).map((part: any): WorkOrderPart => ({
      id: part.id,
      workOrderId: part.work_order_id,
      jobLineId: part.job_line_id,
      inventoryItemId: part.inventory_item_id,
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
      markupPercentage: part.markup_percentage,
      retailPrice: part.retail_price,
      customerPrice: part.customer_price,
      quantity: part.quantity,
      partType: (part.part_type === 'inventory' || part.part_type === 'non-inventory') ? part.part_type : 'non-inventory',
      invoiceNumber: part.invoice_number,
      poLine: part.po_line,
      notes: part.notes,
      createdAt: part.created_at,
      updatedAt: part.updated_at,
      category: part.category,
      isTaxable: part.is_taxable,
      coreChargeAmount: part.core_charge_amount,
      coreChargeApplied: part.core_charge_applied,
      warrantyDuration: part.warranty_duration,
      warrantyExpiryDate: part.warranty_expiry_date,
      installDate: part.install_date,
      installedBy: part.installed_by,
      status: part.status,
      isStockItem: part.is_stock_item,
      dateAdded: part.date_added,
      attachments: part.attachments || [],
      notesInternal: part.notes_internal,
      binLocation: part.bin_location || '',
      warehouseLocation: part.warehouse_location || '',
      shelfLocation: part.shelf_location || '',
    }));
  } catch (error) {
    console.error('Error fetching job line parts:', error);
    throw error;
  }
}

// Save a work order part
export async function saveWorkOrderPart(
  workOrderId: string, 
  partData: WorkOrderPartFormValues, 
  jobLineId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
        job_line_id: jobLineId || null,
        inventory_item_id: partData.inventoryItemId || null,
        part_name: partData.partName,
        part_number: partData.partNumber || '',
        supplier_name: partData.supplierName || '',
        supplier_cost: partData.supplierCost,
        supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice || 0,
        markup_percentage: partData.markupPercentage,
        retail_price: partData.retailPrice,
        customer_price: partData.customerPrice,
        quantity: partData.quantity,
        part_type: partData.partType,
        invoice_number: partData.invoiceNumber || '',
        po_line: partData.poLine || '',
        notes: partData.notes || '',
        category: partData.category || '',
        is_taxable: partData.isTaxable,
        core_charge_amount: partData.coreChargeAmount,
        core_charge_applied: partData.coreChargeApplied,
        warranty_duration: partData.warrantyDuration || '',
        install_date: partData.installDate || '',
        installed_by: partData.installedBy || '',
        status: partData.status,
        is_stock_item: partData.isStockItem,
        date_added: new Date().toISOString(),
        attachments: partData.attachments || [],
        notes_internal: partData.notesInternal || '',
        bin_location: partData.binLocation || '',
        warehouse_location: partData.warehouseLocation || '',
        shelf_location: partData.shelfLocation || '',
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving work order part:', error);
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

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting work order part:', error);
    return false;
  }
}
