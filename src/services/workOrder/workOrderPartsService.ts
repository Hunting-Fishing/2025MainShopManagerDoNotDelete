import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Helper function to map database response to WorkOrderPart
const mapDatabaseToWorkOrderPart = (dbPart: any): WorkOrderPart => {
  return {
    id: dbPart.id,
    work_order_id: dbPart.work_order_id,
    job_line_id: dbPart.job_line_id,
    part_number: dbPart.part_number,
    name: dbPart.part_name || dbPart.name || '',
    description: dbPart.part_description || dbPart.description || '',
    quantity: dbPart.quantity || 0,
    unit_price: dbPart.customer_price || dbPart.unit_price || 0,
    total_price: (dbPart.customer_price || dbPart.unit_price || 0) * (dbPart.quantity || 0),
    status: dbPart.status || 'pending',
    notes: dbPart.notes_internal || dbPart.notes || '',
    created_at: dbPart.created_at,
    updated_at: dbPart.updated_at,
    
    // Additional properties with fallbacks
    partName: dbPart.part_name || dbPart.name,
    partNumber: dbPart.part_number,
    supplierName: dbPart.supplier_name,
    supplierCost: dbPart.supplier_cost,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
    customerPrice: dbPart.customer_price,
    retailPrice: dbPart.retail_price,
    category: dbPart.category,
    warrantyDuration: dbPart.warranty_duration,
    warrantyExpiryDate: dbPart.warranty_expiry_date,
    binLocation: dbPart.bin_location,
    installDate: dbPart.install_date,
    dateAdded: dbPart.date_added || dbPart.created_at,
    part_type: dbPart.part_type,
    installedBy: dbPart.installed_by,
    markupPercentage: dbPart.markup_percentage,
    inventoryItemId: dbPart.inventory_item_id,
    coreChargeApplied: dbPart.core_charge_applied,
    coreChargeAmount: dbPart.core_charge_amount,
    isTaxable: dbPart.is_taxable,
    invoiceNumber: dbPart.invoice_number,
    poLine: dbPart.po_line,
    isStockItem: dbPart.is_stock_item,
    supplierOrderRef: dbPart.supplier_order_ref,
    notesInternal: dbPart.notes_internal,
    attachments: dbPart.attachments,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location
  };
};

// Helper function to map form values to database columns
const mapFormToDatabase = (formData: WorkOrderPartFormValues) => {
  return {
    part_name: formData.name,
    part_number: formData.part_number,
    part_description: formData.description,
    quantity: formData.quantity,
    customer_price: formData.unit_price || formData.customerPrice,
    status: formData.status,
    notes_internal: formData.notes,
    part_type: formData.part_type,
    supplier_cost: formData.supplierCost,
    retail_price: formData.retailPrice,
    markup_percentage: formData.markupPercentage,
    is_taxable: formData.isTaxable,
    core_charge_amount: formData.coreChargeAmount,
    core_charge_applied: formData.coreChargeApplied,
    warranty_duration: formData.warrantyDuration,
    warranty_expiry_date: formData.warrantyExpiryDate,
    install_date: formData.installDate,
    installed_by: formData.installedBy,
    invoice_number: formData.invoiceNumber,
    po_line: formData.poLine,
    is_stock_item: formData.isStockItem,
    supplier_name: formData.supplierName,
    supplier_order_ref: formData.supplierOrderRef,
    notes: formData.notesInternal,
    inventory_item_id: formData.inventoryItemId,
    category: formData.category
  };
};

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId);

  if (error) {
    console.error('Error fetching work order parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabaseToWorkOrderPart);
}

export async function addWorkOrderPart(
  workOrderId: string,
  formData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  try {
    const mappedData = mapFormToDatabase(formData);

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({ ...mappedData, work_order_id: workOrderId })
      .select('*')
      .single();

    if (error) {
      console.error('Error adding work order part:', error);
      throw error;
    }

    return mapDatabaseToWorkOrderPart(data);
  } catch (error) {
    console.error('Failed to add work order part:', error);
    throw error;
  }
}

export async function getWorkOrderPartById(partId: string): Promise<WorkOrderPart | null> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('id', partId)
    .single();

  if (error) {
    console.error('Error fetching work order part by ID:', error);
    throw error;
  }

  return data ? mapDatabaseToWorkOrderPart(data) : null;
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  const { error } = await supabase
    .from('work_order_parts')
    .delete()
    .eq('id', partId);

  if (error) {
    console.error('Error deleting work order part:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(
  partId: string,
  formData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  console.log('🔄 Updating work order part:', { partId, formData });
  
  try {
    const mappedData = mapFormToDatabase(formData);
    console.log('📝 Mapped data for update:', mappedData);

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(mappedData)
      .eq('id', partId)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error updating part:', error);
      throw error;
    }

    console.log('✅ Part updated successfully:', data);
    return mapDatabaseToWorkOrderPart(data);
  } catch (error) {
    console.error('❌ Update part failed:', error);
    throw error;
  }
}

export async function getUnassignedParts(workOrderId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .is('job_line_id', null);

  if (error) {
    console.error('Error fetching unassigned parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabaseToWorkOrderPart);
}

export async function assignPartToJobLine(partId: string, jobLineId: string): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({ job_line_id: jobLineId })
    .eq('id', partId)
    .select('*')
    .single();

  if (error) {
    console.error('Error assigning part to job line:', error);
    throw error;
  }

  return mapDatabaseToWorkOrderPart(data);
}

export async function unassignPart(partId: string): Promise<WorkOrderPart> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({ job_line_id: null })
    .eq('id', partId)
    .select('*')
    .single();

  if (error) {
    console.error('Error unassigning part:', error);
    throw error;
  }

  return mapDatabaseToWorkOrderPart(data);
}

export async function bulkAssignParts(partIds: string[], jobLineId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({ job_line_id: jobLineId })
    .in('id', partIds)
    .select('*');

  if (error) {
    console.error('Error bulk assigning parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabaseToWorkOrderPart);
}

export async function bulkUnassignParts(partIds: string[]): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .update({ job_line_id: null })
    .in('id', partIds)
    .select('*');

  if (error) {
    console.error('Error bulk unassigning parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabaseToWorkOrderPart);
}

export async function getPartsByJobLine(workOrderId: string, jobLineId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .eq('job_line_id', jobLineId);

  if (error) {
    console.error('Error fetching parts by job line:', error);
    throw error;
  }

  return (data || []).map(mapDatabaseToWorkOrderPart);
}
