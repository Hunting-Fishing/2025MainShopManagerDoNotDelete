
import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { mapDatabasePartToWorkOrderPart } from '@/utils/databaseMappers';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching work order parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}

export async function createWorkOrderPart(
  workOrderId: string, 
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  const dbData = {
    work_order_id: workOrderId,
    job_line_id: partData.job_line_id || null,
    part_number: partData.part_number,
    part_name: partData.name,
    part_description: partData.description || '',
    quantity: partData.quantity,
    customer_price: partData.unit_price,
    status: partData.status || 'pending',
    notes_internal: partData.notes || '',
    part_type: partData.part_type,
    category: partData.category || null,
    supplier_name: partData.supplierName || null,
    supplier_cost: partData.supplierCost || null,
    retail_price: partData.retailPrice || null,
    markup_percentage: partData.markupPercentage || null,
    is_taxable: partData.isTaxable || false,
    core_charge_amount: partData.coreChargeAmount || null,
    core_charge_applied: partData.coreChargeApplied || false,
    warranty_duration: partData.warrantyDuration || null,
    install_date: partData.installDate || null,
    installed_by: partData.installedBy || null,
    invoice_number: partData.invoiceNumber || null,
    po_line: partData.poLine || null,
    is_stock_item: partData.isStockItem || false,
    supplier_order_ref: partData.supplierOrderRef || null,
    inventory_item_id: partData.inventoryItemId || null
  };

  const { data, error } = await supabase
    .from('work_order_parts')
    .insert(dbData)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating work order part:', error);
    throw error;
  }

  return mapDatabasePartToWorkOrderPart(data);
}

export async function updateWorkOrderPart(
  partId: string, 
  partData: Partial<WorkOrderPartFormValues>
): Promise<WorkOrderPart> {
  const updateData: any = {};
  
  if (partData.name !== undefined) updateData.part_name = partData.name;
  if (partData.part_number !== undefined) updateData.part_number = partData.part_number;
  if (partData.description !== undefined) updateData.part_description = partData.description;
  if (partData.quantity !== undefined) updateData.quantity = partData.quantity;
  if (partData.unit_price !== undefined) updateData.customer_price = partData.unit_price;
  if (partData.status !== undefined) updateData.status = partData.status;
  if (partData.notes !== undefined) updateData.notes_internal = partData.notes;
  if (partData.job_line_id !== undefined) updateData.job_line_id = partData.job_line_id;
  if (partData.part_type !== undefined) updateData.part_type = partData.part_type;
  if (partData.category !== undefined) updateData.category = partData.category;
  if (partData.supplierName !== undefined) updateData.supplier_name = partData.supplierName;
  if (partData.supplierCost !== undefined) updateData.supplier_cost = partData.supplierCost;
  if (partData.retailPrice !== undefined) updateData.retail_price = partData.retailPrice;

  const { data, error } = await supabase
    .from('work_order_parts')
    .update(updateData)
    .eq('id', partId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating work order part:', error);
    throw error;
  }

  return mapDatabasePartToWorkOrderPart(data);
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

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('job_line_id', jobLineId);

  if (error) {
    console.error('Error fetching job line parts:', error);
    throw error;
  }

  return (data || []).map(mapDatabasePartToWorkOrderPart);
}
