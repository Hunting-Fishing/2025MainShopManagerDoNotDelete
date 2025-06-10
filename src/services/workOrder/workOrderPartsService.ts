
import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Database to TypeScript mapping helper
const mapDbPartToTypescript = (dbPart: any): WorkOrderPart => {
  return {
    id: dbPart.id,
    workOrderId: dbPart.work_order_id,
    jobLineId: dbPart.job_line_id || undefined,
    inventoryItemId: dbPart.inventory_item_id || undefined,
    partName: dbPart.part_name,
    partNumber: dbPart.part_number || undefined,
    supplierName: dbPart.supplier_name || undefined,
    supplierCost: dbPart.supplier_cost || 0,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price || undefined,
    markupPercentage: dbPart.markup_percentage || 0,
    retailPrice: dbPart.retail_price || 0,
    customerPrice: dbPart.customer_price || 0,
    quantity: dbPart.quantity || 1,
    partType: dbPart.part_type,
    invoiceNumber: dbPart.invoice_number || undefined,
    poLine: dbPart.po_line || undefined,
    notes: dbPart.notes || undefined,
    createdAt: dbPart.created_at,
    updatedAt: dbPart.updated_at,
    category: dbPart.category || undefined,
    isTaxable: dbPart.is_taxable ?? true,
    coreChargeAmount: dbPart.core_charge_amount || 0,
    coreChargeApplied: dbPart.core_charge_applied ?? false,
    warrantyDuration: dbPart.warranty_duration || undefined,
    warrantyExpiryDate: dbPart.warranty_expiry_date || undefined,
    installDate: dbPart.install_date || undefined,
    installedBy: dbPart.installed_by || undefined,
    status: dbPart.status || 'ordered',
    isStockItem: dbPart.is_stock_item ?? true,
    dateAdded: dbPart.date_added || dbPart.created_at,
    attachments: Array.isArray(dbPart.attachments) ? dbPart.attachments : [],
    notesInternal: dbPart.notes_internal || undefined,
    binLocation: dbPart.bin_location || undefined,
    warehouseLocation: dbPart.warehouse_location || undefined,
    shelfLocation: dbPart.shelf_location || undefined
  };
};

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
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

    return (data || []).map(mapDbPartToTypescript);
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
};

export const getJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
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

    return (data || []).map(mapDbPartToTypescript);
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
};

export const addWorkOrderPart = async (
  workOrderId: string,
  jobLineId: string | undefined,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> => {
  try {
    console.log('Adding part to work order:', { workOrderId, jobLineId, partData });

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
      console.error('Error adding work order part:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    // Fetch the created part to return full data
    const { data: createdPart, error: fetchError } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      console.error('Error fetching created part:', fetchError);
      throw fetchError;
    }

    return mapDbPartToTypescript(createdPart);
  } catch (error) {
    console.error('Error in addWorkOrderPart:', error);
    throw error;
  }
};

export const updateWorkOrderPart = async (
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<WorkOrderPart> => {
  try {
    const { data, error } = await supabase.rpc('update_work_order_part', {
      p_id: partId,
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
      console.error('Error updating work order part:', error);
      throw error;
    }

    // Fetch the updated part to return full data
    const { data: updatedPart, error: fetchError } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('id', partId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated part:', fetchError);
      throw fetchError;
    }

    return mapDbPartToTypescript(updatedPart);
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
};

export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('delete_work_order_part', {
      part_id_param: partId
    });

    if (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
};
