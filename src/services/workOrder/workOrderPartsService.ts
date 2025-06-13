
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Database to WorkOrderPart mapper
function mapDbPartToWorkOrderPart(dbPart: any): WorkOrderPart {
  return {
    id: dbPart.id,
    work_order_id: dbPart.work_order_id,
    job_line_id: dbPart.job_line_id,
    part_number: dbPart.part_number || dbPart.partNumber || '',
    name: dbPart.part_name || dbPart.name || dbPart.partName || '',
    description: dbPart.description || '',
    quantity: dbPart.quantity || 1,
    unit_price: dbPart.customer_price || dbPart.unit_price || dbPart.customerPrice || 0,
    total_price: dbPart.total_price || (dbPart.quantity * (dbPart.customer_price || dbPart.unit_price || 0)),
    status: dbPart.status || 'pending',
    notes: dbPart.notes || dbPart.notesInternal || '',
    created_at: dbPart.created_at || dbPart.date_added || new Date().toISOString(),
    updated_at: dbPart.updated_at || new Date().toISOString(),
    
    // Additional properties from database
    partName: dbPart.part_name || dbPart.partName,
    partNumber: dbPart.part_number || dbPart.partNumber,
    supplierName: dbPart.supplier_name || dbPart.supplierName,
    supplierCost: dbPart.supplier_cost || dbPart.supplierCost,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price || dbPart.supplierSuggestedRetailPrice,
    customerPrice: dbPart.customer_price || dbPart.customerPrice,
    retailPrice: dbPart.retail_price || dbPart.retailPrice,
    category: dbPart.category,
    warrantyDuration: dbPart.warranty_duration || dbPart.warrantyDuration,
    warrantyExpiryDate: dbPart.warranty_expiry_date || dbPart.warrantyExpiryDate,
    binLocation: dbPart.bin_location || dbPart.binLocation,
    installDate: dbPart.install_date || dbPart.installDate,
    dateAdded: dbPart.date_added || dbPart.dateAdded || dbPart.created_at,
    partType: dbPart.part_type || dbPart.partType,
    installedBy: dbPart.installed_by || dbPart.installedBy,
    markupPercentage: dbPart.markup_percentage || dbPart.markupPercentage,
    inventoryItemId: dbPart.inventory_item_id || dbPart.inventoryItemId,
    coreChargeApplied: dbPart.core_charge_applied || dbPart.coreChargeApplied || false,
    coreChargeAmount: dbPart.core_charge_amount || dbPart.coreChargeAmount || 0,
    isTaxable: dbPart.is_taxable || dbPart.isTaxable || true,
    invoiceNumber: dbPart.invoice_number || dbPart.invoiceNumber,
    poLine: dbPart.po_line || dbPart.poLine,
    isStockItem: dbPart.is_stock_item || dbPart.isStockItem || false,
    notesInternal: dbPart.notes_internal || dbPart.notesInternal,
    attachments: dbPart.attachments,
    warehouseLocation: dbPart.warehouse_location || dbPart.warehouseLocation,
    shelfLocation: dbPart.shelf_location || dbPart.shelfLocation,
    
    // Backward compatibility aliases
    workOrderId: dbPart.work_order_id,
    jobLineId: dbPart.job_line_id
  };
}

// WorkOrderPart to database mapper
function mapWorkOrderPartToDb(part: Partial<WorkOrderPart>) {
  return {
    work_order_id: part.work_order_id,
    job_line_id: part.job_line_id,
    part_number: part.part_number || part.partNumber || '',
    part_name: part.name || part.partName || '',
    description: part.description || '',
    quantity: part.quantity || 1,
    customer_price: part.unit_price || part.customerPrice || 0,
    total_price: part.total_price || 0,
    status: part.status || 'pending',
    notes: part.notes || '',
    
    // Additional database fields
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
    core_charge_applied: part.coreChargeApplied || false,
    core_charge_amount: part.coreChargeAmount || 0,
    is_taxable: part.isTaxable !== false,
    invoice_number: part.invoiceNumber,
    po_line: part.poLine,
    is_stock_item: part.isStockItem || false,
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
      throw new Error(`Failed to fetch work order parts: ${error.message}`);
    }

    return (data || []).map(mapDbPartToWorkOrderPart);
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
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw new Error(`Failed to fetch job line parts: ${error.message}`);
    }

    return (data || []).map(mapDbPartToWorkOrderPart);
  } catch (error) {
    console.error('Exception in getJobLineParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(part: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    const dbPart = mapWorkOrderPartToDb(part);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert(dbPart)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw new Error(`Failed to create work order part: ${error.message}`);
    }

    return mapDbPartToWorkOrderPart(data);
  } catch (error) {
    console.error('Exception in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(part: WorkOrderPart): Promise<WorkOrderPart> {
  try {
    const dbPart = mapWorkOrderPartToDb(part);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        ...dbPart,
        updated_at: new Date().toISOString()
      })
      .eq('id', part.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw new Error(`Failed to update work order part: ${error.message}`);
    }

    return mapDbPartToWorkOrderPart(data);
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
