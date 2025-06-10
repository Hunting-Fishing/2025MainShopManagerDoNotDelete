import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

export const getJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('jobLineId', jobLineId);

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
};

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('workOrderId', workOrderId);

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
};

export const addWorkOrderPart = async (
  workOrderId: string,
  jobLineId: string | undefined,
  partData: WorkOrderPartFormValues
): Promise<string> => {
  try {
    const { partName, partNumber, supplierName, supplierCost, supplierSuggestedRetailPrice, markupPercentage, retailPrice, customerPrice, quantity, partType, inventoryItemId, category, isTaxable, coreChargeAmount, coreChargeApplied, warrantyDuration, installDate, installedBy, status, isStockItem, invoiceNumber, poLine, notes, notesInternal, binLocation, warehouseLocation, shelfLocation, attachments } = partData;

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert([
        {
          workOrderId,
          jobLineId,
          inventoryItemId,
          partName,
          partNumber,
          supplierName,
          supplierCost,
          supplierSuggestedRetailPrice,
          markupPercentage,
          retailPrice,
          customerPrice,
          quantity,
          partType,
          category,
          isTaxable,
          coreChargeAmount,
          coreChargeApplied,
          warrantyDuration,
          installDate,
          installedBy,
          status,
          isStockItem,
          invoiceNumber,
          poLine,
          notes,
          notesInternal,
          binLocation,
          warehouseLocation,
          shelfLocation,
          attachments
        }
      ])
      .select()

    if (error) {
      console.error('Error adding work order part:', error);
      throw error;
    }

    return data[0].id;
  } catch (error) {
    console.error('Error in addWorkOrderPart:', error);
    throw error;
  }
};

// Add the missing saveWorkOrderPart export (alias for addWorkOrderPart)
export const saveWorkOrderPart = addWorkOrderPart;

// Add the missing saveMultipleWorkOrderParts function
export const saveMultipleWorkOrderParts = async (
  workOrderId: string,
  jobLineId: string | undefined,
  parts: WorkOrderPartFormValues[]
): Promise<void> => {
  console.log('Saving multiple work order parts:', { workOrderId, jobLineId, parts });
  
  for (const part of parts) {
    await addWorkOrderPart(workOrderId, jobLineId, part);
  }
};

export const updateWorkOrderPart = async (
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update(partData)
      .eq('id', partId)

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
};

export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
};
