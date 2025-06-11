
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Map database fields to our TypeScript interface
const mapDbPartToWorkOrderPart = (dbPart: any): WorkOrderPart => ({
  id: dbPart.id,
  workOrderId: dbPart.work_order_id,
  jobLineId: dbPart.job_line_id,
  inventoryItemId: dbPart.inventory_item_id,
  partName: dbPart.part_name,
  partNumber: dbPart.part_number,
  supplierName: dbPart.supplier_name,
  supplierCost: dbPart.supplier_cost,
  supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
  markupPercentage: dbPart.markup_percentage,
  retailPrice: dbPart.retail_price,
  customerPrice: dbPart.customer_price,
  quantity: dbPart.quantity,
  partType: dbPart.part_type,
  invoiceNumber: dbPart.invoice_number,
  poLine: dbPart.po_line,
  notes: dbPart.notes,
  createdAt: dbPart.created_at,
  updatedAt: dbPart.updated_at,
  category: dbPart.category,
  isTaxable: dbPart.is_taxable,
  coreChargeAmount: dbPart.core_charge_amount,
  coreChargeApplied: dbPart.core_charge_applied,
  warrantyDuration: dbPart.warranty_duration,
  warrantyExpiryDate: dbPart.warranty_expiry_date,
  installDate: dbPart.install_date,
  installedBy: dbPart.installed_by,
  status: dbPart.status,
  isStockItem: dbPart.is_stock_item,
  dateAdded: dbPart.date_added,
  attachments: Array.isArray(dbPart.attachments) ? dbPart.attachments : [],
  notesInternal: dbPart.notes_internal,
  binLocation: dbPart.bin_location,
  warehouseLocation: dbPart.warehouse_location,
  shelfLocation: dbPart.shelf_location
});

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching work order parts:', error);
    throw error;
  }

  return data?.map(mapDbPartToWorkOrderPart) || [];
};

export const getJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('job_line_id', jobLineId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching job line parts:', error);
    throw error;
  }

  return data?.map(mapDbPartToWorkOrderPart) || [];
};

export const saveWorkOrderPart = async (
  workOrderId: string,
  partData: WorkOrderPartFormValues,
  jobLineId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('insert_work_order_part', {
      p_work_order_id: workOrderId,
      p_job_line_id: jobLineId || null,
      p_inventory_item_id: partData.inventoryItemId || null,
      p_part_name: partData.partName,
      p_part_number: partData.partNumber || '',
      p_supplier_name: partData.supplierName || '',
      p_supplier_cost: partData.supplierCost,
      p_markup_percentage: partData.markupPercentage,
      p_retail_price: partData.retailPrice,
      p_customer_price: partData.customerPrice,
      p_quantity: partData.quantity,
      p_part_type: partData.partType,
      p_invoice_number: partData.invoiceNumber || '',
      p_po_line: partData.poLine || '',
      p_notes: partData.notes || '',
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
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveWorkOrderPart:', error);
    return false;
  }
};

export const deleteWorkOrderPart = async (partId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('delete_work_order_part', {
      part_id_param: partId
    });

    if (error) {
      console.error('Error deleting work order part:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    return false;
  }
};
