
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  console.log('Fetching parts for work order:', workOrderId);
  
  const { data, error } = await supabase.rpc('get_work_order_parts', {
    work_order_id_param: workOrderId
  });

  if (error) {
    console.error('Error fetching work order parts:', error);
    throw error;
  }

  console.log('Work order parts fetched:', data);
  
  // Map database response to TypeScript interface
  const mappedData = (data || []).map((part: any): WorkOrderPart => ({
    id: part.id,
    workOrderId: part.work_order_id,
    jobLineId: part.job_line_id,
    inventoryItemId: part.inventory_item_id,
    partName: part.part_name,
    partNumber: part.part_number,
    supplierName: part.supplier_name,
    supplierCost: part.supplier_cost,
    markupPercentage: part.markup_percentage,
    retailPrice: part.retail_price,
    customerPrice: part.customer_price,
    quantity: part.quantity,
    partType: part.part_type as 'inventory' | 'non-inventory',
    invoiceNumber: part.invoice_number,
    poLine: part.po_line,
    notes: part.notes,
    createdAt: part.created_at,
    updatedAt: part.updated_at
  }));

  return mappedData;
};

export const saveWorkOrderPart = async (
  workOrderId: string,
  jobLineId: string | undefined,
  partData: WorkOrderPartFormValues
): Promise<string> => {
  console.log('Saving work order part:', { workOrderId, jobLineId, partData });

  const { data, error } = await supabase.rpc('insert_work_order_part', {
    p_work_order_id: workOrderId,
    p_job_line_id: jobLineId || null,
    p_inventory_item_id: partData.inventoryItemId || null,
    p_part_name: partData.partName,
    p_part_number: partData.partNumber || null,
    p_supplier_name: partData.supplierName || null,
    p_supplier_cost: partData.supplierCost,
    p_markup_percentage: partData.markupPercentage,
    p_retail_price: partData.retailPrice,
    p_customer_price: partData.customerPrice,
    p_quantity: partData.quantity,
    p_part_type: partData.partType,
    p_invoice_number: partData.invoiceNumber || null,
    p_po_line: partData.poLine || null,
    p_notes: partData.notes || null
  });

  if (error) {
    console.error('Error saving work order part:', error);
    throw error;
  }

  console.log('Work order part saved with ID:', data);
  return data;
};

export const updateWorkOrderPart = async (
  partId: string,
  partData: Omit<WorkOrderPartFormValues, 'inventoryItemId'>
): Promise<string> => {
  console.log('Updating work order part:', { partId, partData });

  const { data, error } = await supabase.rpc('update_work_order_part', {
    p_id: partId,
    p_part_name: partData.partName,
    p_part_number: partData.partNumber || null,
    p_supplier_name: partData.supplierName || null,
    p_supplier_cost: partData.supplierCost,
    p_markup_percentage: partData.markupPercentage,
    p_retail_price: partData.retailPrice,
    p_customer_price: partData.customerPrice,
    p_quantity: partData.quantity,
    p_part_type: partData.partType,
    p_invoice_number: partData.invoiceNumber || null,
    p_po_line: partData.poLine || null,
    p_notes: partData.notes || null
  });

  if (error) {
    console.error('Error updating work order part:', error);
    throw error;
  }

  console.log('Work order part updated:', data);
  return data;
};

export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
  console.log('Deleting work order part:', partId);

  const { error } = await supabase.rpc('delete_work_order_part', {
    part_id_param: partId
  });

  if (error) {
    console.error('Error deleting work order part:', error);
    throw error;
  }

  console.log('Work order part deleted');
};

export const saveMultipleWorkOrderParts = async (
  workOrderId: string,
  jobLineId: string | undefined,
  parts: WorkOrderPartFormValues[]
): Promise<string[]> => {
  console.log('Saving multiple work order parts:', { workOrderId, jobLineId, parts });

  const savedPartIds: string[] = [];

  for (const part of parts) {
    try {
      const partId = await saveWorkOrderPart(workOrderId, jobLineId, part);
      savedPartIds.push(partId);
    } catch (error) {
      console.error('Error saving part:', error);
      // Continue with other parts even if one fails
    }
  }

  console.log('Saved parts with IDs:', savedPartIds);
  return savedPartIds;
};
