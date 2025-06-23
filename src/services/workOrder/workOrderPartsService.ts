import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { mapDatabasePartToWorkOrderPart } from '@/utils/databaseMappers';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  console.log('Fetching parts for work order:', workOrderId);
  
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching work order parts:', error);
    throw new Error(`Failed to fetch parts: ${error.message}`);
  }

  console.log('Raw parts data from database:', data);
  
  if (!data || data.length === 0) {
    console.log('No parts found for work order');
    return [];
  }

  const mappedParts = data.map(mapDatabasePartToWorkOrderPart);
  console.log('Mapped parts:', mappedParts);
  
  return mappedParts;
}

export async function createWorkOrderPart(
  workOrderId: string, 
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  console.log('Creating work order part:', { workOrderId, partData });

  // Map form data to database format
  const dbPartData = {
    work_order_id: workOrderId,
    part_name: partData.name,
    part_number: partData.part_number,
    part_description: partData.description || null,
    quantity: partData.quantity,
    customer_price: partData.unit_price,
    status: partData.status || 'pending',
    notes_internal: partData.notes || null,
    job_line_id: partData.job_line_id || null,
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
    invoice_number: partData.invoiceNumber || null,
    is_stock_item: partData.isStockItem || false,
  };

  const { data, error } = await supabase
    .from('work_order_parts')
    .insert([dbPartData])
    .select()
    .single();

  if (error) {
    console.error('Error creating work order part:', error);
    throw new Error(`Failed to create part: ${error.message}`);
  }

  console.log('Created part data:', data);
  return mapDatabasePartToWorkOrderPart(data);
}

export async function updateWorkOrderPart(
  partId: string,
  updates: Partial<WorkOrderPartFormValues>
): Promise<WorkOrderPart> {
  console.log('Updating work order part:', { partId, updates });

  // Map form data to database format
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.part_name = updates.name;
  if (updates.part_number !== undefined) dbUpdates.part_number = updates.part_number;
  if (updates.description !== undefined) dbUpdates.part_description = updates.description;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes_internal = updates.notes;
  if (updates.job_line_id !== undefined) dbUpdates.job_line_id = updates.job_line_id;
  if (updates.part_type !== undefined) dbUpdates.part_type = updates.part_type;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.supplierName !== undefined) dbUpdates.supplier_name = updates.supplierName;
  if (updates.supplierCost !== undefined) dbUpdates.supplier_cost = updates.supplierCost;
  if (updates.retailPrice !== undefined) dbUpdates.retail_price = updates.retailPrice;
  if (updates.markupPercentage !== undefined) dbUpdates.markup_percentage = updates.markupPercentage;
  if (updates.isTaxable !== undefined) dbUpdates.is_taxable = updates.isTaxable;
  if (updates.coreChargeAmount !== undefined) dbUpdates.core_charge_amount = updates.coreChargeAmount;
  if (updates.coreChargeApplied !== undefined) dbUpdates.core_charge_applied = updates.coreChargeApplied;
  if (updates.warrantyDuration !== undefined) dbUpdates.warranty_duration = updates.warrantyDuration;
  if (updates.invoiceNumber !== undefined) dbUpdates.invoice_number = updates.invoiceNumber;
  if (updates.isStockItem !== undefined) dbUpdates.is_stock_item = updates.isStockItem;

  const { data, error } = await supabase
    .from('work_order_parts')
    .update(dbUpdates)
    .eq('id', partId)
    .select()
    .single();

  if (error) {
    console.error('Error updating work order part:', error);
    throw new Error(`Failed to update part: ${error.message}`);
  }

  console.log('Updated part data:', data);
  return mapDatabasePartToWorkOrderPart(data);
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  console.log('Deleting work order part:', partId);

  const { error } = await supabase
    .from('work_order_parts')
    .delete()
    .eq('id', partId);

  if (error) {
    console.error('Error deleting work order part:', error);
    throw new Error(`Failed to delete part: ${error.message}`);
  }

  console.log('Successfully deleted part:', partId);
}

export async function getPartsByJobLine(jobLineId: string): Promise<WorkOrderPart[]> {
  console.log('Fetching parts for job line:', jobLineId);
  
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('job_line_id', jobLineId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching job line parts:', error);
    throw new Error(`Failed to fetch job line parts: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(mapDatabasePartToWorkOrderPart);
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  return getPartsByJobLine(jobLineId);
}
