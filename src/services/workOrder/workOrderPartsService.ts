
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Map database fields to WorkOrderPart interface
const mapDatabaseToWorkOrderPart = (dbPart: any): WorkOrderPart => {
  return {
    id: dbPart.id,
    work_order_id: dbPart.work_order_id,
    job_line_id: dbPart.job_line_id,
    part_number: dbPart.part_number,
    name: dbPart.part_name || dbPart.name || 'Unnamed Part',
    description: dbPart.description || '',
    quantity: dbPart.quantity || 0,
    unit_price: dbPart.customer_price || dbPart.unit_price || 0,
    total_price: (dbPart.customer_price || dbPart.unit_price || 0) * (dbPart.quantity || 0),
    status: dbPart.status || 'pending',
    notes: dbPart.notes_internal || dbPart.notes || '',
    created_at: dbPart.created_at,
    updated_at: dbPart.updated_at,
    
    // Extended properties
    category: dbPart.category,
    partName: dbPart.part_name,
    partNumber: dbPart.part_number,
    customerPrice: dbPart.customer_price,
    supplierCost: dbPart.supplier_cost,
    retailPrice: dbPart.retail_price,
    markupPercentage: dbPart.markup_percentage,
    isTaxable: dbPart.is_taxable,
    coreChargeAmount: dbPart.core_charge_amount,
    coreChargeApplied: dbPart.core_charge_applied,
    warrantyDuration: dbPart.warranty_duration,
    warrantyExpiryDate: dbPart.warranty_expiry_date,
    installDate: dbPart.install_date,
    installedBy: dbPart.installed_by,
    invoiceNumber: dbPart.invoice_number,
    poLine: dbPart.po_line,
    isStockItem: dbPart.is_stock_item,
    supplierName: dbPart.supplier_name,
    supplierOrderRef: dbPart.supplier_order_ref,
    notesInternal: dbPart.notes_internal,
    inventoryItemId: dbPart.inventory_item_id,
    partType: dbPart.part_type,
    estimatedArrivalDate: dbPart.estimated_arrival_date,
    itemStatus: dbPart.item_status,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
    dateAdded: dbPart.date_added,
    binLocation: dbPart.bin_location,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location,
    attachments: dbPart.attachments
  };
};

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    return (data || []).map(mapDatabaseToWorkOrderPart);
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(
  workOrderId: string,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number,
        part_name: partData.name,
        description: partData.description,
        quantity: partData.quantity,
        customer_price: partData.unit_price,
        status: partData.status || 'pending',
        notes_internal: partData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    return mapDatabaseToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<WorkOrderPart> {
  try {
    const updateData: any = {};
    
    if (partData.name !== undefined) updateData.part_name = partData.name;
    if (partData.part_number !== undefined) updateData.part_number = partData.part_number;
    if (partData.description !== undefined) updateData.description = partData.description;
    if (partData.quantity !== undefined) updateData.quantity = partData.quantity;
    if (partData.unit_price !== undefined) updateData.customer_price = partData.unit_price;
    if (partData.status !== undefined) updateData.status = partData.status;
    if (partData.notes !== undefined) updateData.notes_internal = partData.notes;
    if (partData.job_line_id !== undefined) updateData.job_line_id = partData.job_line_id;

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updateData)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    return mapDatabaseToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
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
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    return (data || []).map(mapDatabaseToWorkOrderPart);
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}
