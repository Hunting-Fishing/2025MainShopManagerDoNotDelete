
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase.rpc('get_work_order_parts', {
      work_order_id_param: workOrderId
    });

    if (error) throw error;

    return (data || []).map((item: any): WorkOrderPart => ({
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
      partType: item.part_type as 'inventory' | 'non-inventory',
      invoiceNumber: item.invoice_number,
      poLine: item.po_line,
      notes: item.notes,
      category: item.category,
      isTaxable: item.is_taxable,
      coreChargeAmount: item.core_charge_amount,
      coreChargeApplied: item.core_charge_applied,
      warrantyDuration: item.warranty_duration,
      warrantyExpiryDate: item.warranty_expiry_date,
      installDate: item.install_date,
      installedBy: item.installed_by,
      status: item.status,
      isStockItem: item.is_stock_item,
      dateAdded: item.created_at,
      attachments: [],
      notesInternal: item.notes_internal,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Error loading work order parts:', error);
    throw new Error('Failed to load work order parts');
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase.rpc('get_job_line_parts', {
      job_line_id_param: jobLineId
    });

    if (error) throw error;

    return (data || []).map((item: any): WorkOrderPart => ({
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
      partType: item.part_type as 'inventory' | 'non-inventory',
      invoiceNumber: item.invoice_number,
      poLine: item.po_line,
      notes: item.notes,
      category: item.category,
      isTaxable: item.is_taxable,
      coreChargeAmount: item.core_charge_amount,
      coreChargeApplied: item.core_charge_applied,
      warrantyDuration: item.warranty_duration,
      warrantyExpiryDate: item.warranty_expiry_date,
      installDate: item.install_date,
      installedBy: item.installed_by,
      status: item.status,
      isStockItem: item.is_stock_item,
      dateAdded: item.created_at,
      attachments: [],
      notesInternal: item.notes_internal,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Error loading job line parts:', error);
    throw new Error('Failed to load job line parts');
  }
}

export async function saveWorkOrderPart(
  workOrderId: string,
  jobLineId: string | undefined,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart | null> {
  try {
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

    if (error) throw error;

    // Return the created part by fetching it
    if (data) {
      const parts = await getWorkOrderParts(workOrderId);
      return parts.find(part => part.id === data) || null;
    }

    return null;
  } catch (error) {
    console.error('Error saving work order part:', error);
    throw new Error('Failed to save work order part');
  }
}

export async function saveMultipleWorkOrderParts(
  workOrderId: string,
  jobLineId: string | undefined,
  partsData: WorkOrderPartFormValues[]
): Promise<WorkOrderPart[]> {
  try {
    const savedParts: WorkOrderPart[] = [];

    for (const partData of partsData) {
      const savedPart = await saveWorkOrderPart(workOrderId, jobLineId, partData);
      if (savedPart) {
        savedParts.push(savedPart);
      }
    }

    return savedParts;
  } catch (error) {
    console.error('Error saving multiple work order parts:', error);
    throw new Error('Failed to save work order parts');
  }
}

export async function updateWorkOrderPart(
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<void> {
  try {
    const { error } = await supabase.rpc('update_work_order_part', {
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
      p_status: partData.status || 'ordered',
      p_is_stock_item: partData.isStockItem ?? true
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating work order part:', error);
    throw new Error('Failed to update work order part');
  }
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('delete_work_order_part', {
      part_id_param: partId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting work order part:', error);
    throw new Error('Failed to delete work order part');
  }
}
