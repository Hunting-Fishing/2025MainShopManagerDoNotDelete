
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

/**
 * Map WorkOrderPart form values to database format
 */
export const mapWorkOrderPartToDb = (part: WorkOrderPartFormValues, workOrderId: string, jobLineId?: string) => {
  return {
    work_order_id: workOrderId,
    job_line_id: jobLineId || null,
    part_name: part.name,
    part_number: part.part_number,
    quantity: part.quantity,
    customer_price: part.unit_price || 0,
    supplier_cost: part.supplierCost || 0,
    retail_price: part.retailPrice || 0,
    supplier_name: part.supplierName || '',
    category: part.category || '',
    part_type: part.partType || 'OEM',
    markup_percentage: part.markupPercentage || 0,
    is_taxable: part.isTaxable !== undefined ? part.isTaxable : true,
    core_charge_amount: part.coreChargeAmount || 0,
    core_charge_applied: part.coreChargeApplied || false,
    warranty_duration: part.warrantyDuration || '',
    invoice_number: part.invoiceNumber || '',
    po_line: part.poLine || '',
    is_stock_item: part.isStockItem || false,
    notes: part.notes || '',
    status: part.status || 'pending'
  };
};

/**
 * Map database row to WorkOrderPart format
 */
export const mapDbRowToWorkOrderPart = (row: any): WorkOrderPart => {
  return {
    id: row.id,
    work_order_id: row.work_order_id,
    job_line_id: row.job_line_id,
    part_number: row.part_number,
    name: row.part_name,
    partName: row.part_name,
    description: row.notes,
    quantity: row.quantity,
    unit_price: row.customer_price,
    total_price: row.customer_price * row.quantity,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: row.category,
    customerPrice: row.customer_price,
    supplierCost: row.supplier_cost,
    retailPrice: row.retail_price,
    supplierName: row.supplier_name,
    partType: row.part_type,
    markupPercentage: row.markup_percentage,
    isTaxable: row.is_taxable,
    coreChargeAmount: row.core_charge_amount,
    coreChargeApplied: row.core_charge_applied,
    warrantyDuration: row.warranty_duration,
    invoiceNumber: row.invoice_number,
    poLine: row.po_line,
    isStockItem: row.is_stock_item
  };
};

/**
 * Get work order parts by work order ID
 */
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

  return (data || []).map(mapDbRowToWorkOrderPart);
};

/**
 * Get parts by job line ID
 */
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

  return (data || []).map(mapDbRowToWorkOrderPart);
};

/**
 * Create a new work order part
 */
export const createWorkOrderPart = async (
  partData: WorkOrderPartFormValues,
  workOrderId: string,
  jobLineId?: string
): Promise<WorkOrderPart> => {
  const dbData = mapWorkOrderPartToDb(partData, workOrderId, jobLineId);
  
  const { data, error } = await supabase
    .from('work_order_parts')
    .insert(dbData)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating work order part:', error);
    throw error;
  }

  return mapDbRowToWorkOrderPart(data);
};

/**
 * Update an existing work order part
 */
export const updateWorkOrderPart = async (
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<WorkOrderPart> => {
  // Only include fields that exist in the database
  const dbData: any = {};
  
  if (partData.name !== undefined) dbData.part_name = partData.name;
  if (partData.part_number !== undefined) dbData.part_number = partData.part_number;
  if (partData.quantity !== undefined) dbData.quantity = partData.quantity;
  if (partData.unit_price !== undefined) dbData.customer_price = partData.unit_price;
  if (partData.supplierCost !== undefined) dbData.supplier_cost = partData.supplierCost;
  if (partData.retailPrice !== undefined) dbData.retail_price = partData.retailPrice;
  if (partData.supplierName !== undefined) dbData.supplier_name = partData.supplierName;
  if (partData.category !== undefined) dbData.category = partData.category;
  if (partData.partType !== undefined) dbData.part_type = partData.partType;
  if (partData.markupPercentage !== undefined) dbData.markup_percentage = partData.markupPercentage;
  if (partData.isTaxable !== undefined) dbData.is_taxable = partData.isTaxable;
  if (partData.coreChargeAmount !== undefined) dbData.core_charge_amount = partData.coreChargeAmount;
  if (partData.coreChargeApplied !== undefined) dbData.core_charge_applied = partData.coreChargeApplied;
  if (partData.warrantyDuration !== undefined) dbData.warranty_duration = partData.warrantyDuration;
  if (partData.invoiceNumber !== undefined) dbData.invoice_number = partData.invoiceNumber;
  if (partData.poLine !== undefined) dbData.po_line = partData.poLine;
  if (partData.isStockItem !== undefined) dbData.is_stock_item = partData.isStockItem;
  if (partData.notes !== undefined) dbData.notes = partData.notes;
  if (partData.status !== undefined) dbData.status = partData.status;

  const { data, error } = await supabase
    .from('work_order_parts')
    .update(dbData)
    .eq('id', partId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating work order part:', error);
    throw error;
  }

  return mapDbRowToWorkOrderPart(data);
};

/**
 * Delete a work order part
 */
export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
  const { error } = await supabase
    .from('work_order_parts')
    .delete()
    .eq('id', partId);

  if (error) {
    console.error('Error deleting work order part:', error);
    throw error;
  }
};
