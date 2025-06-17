
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Helper function to map database response to WorkOrderPart
const mapDatabasePartToWorkOrderPart = (dbPart: any): WorkOrderPart => {
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
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location,
    installDate: dbPart.install_date,
    dateAdded: dbPart.date_added || dbPart.created_at,
    partType: dbPart.part_type,
    installedBy: dbPart.installed_by,
    markupPercentage: dbPart.markup_percentage,
    inventoryItemId: dbPart.inventory_item_id,
    coreChargeApplied: dbPart.core_charge_applied,
    coreChargeAmount: dbPart.core_charge_amount,
    isTaxable: dbPart.is_taxable,
    invoiceNumber: dbPart.invoice_number,
    poLine: dbPart.po_line,
    isStockItem: dbPart.is_stock_item,
    notesInternal: dbPart.notes_internal,
    attachments: dbPart.attachments,
    estimatedArrivalDate: dbPart.estimated_arrival_date,
    itemStatus: dbPart.item_status
  };
};

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching parts:', error);
      throw error;
    }

    return (data || []).map(mapDatabasePartToWorkOrderPart);
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
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
      throw error;
    }

    return (data || []).map(mapDatabasePartToWorkOrderPart);
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
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
        part_description: partData.description,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        customer_price: partData.unit_price,
        status: partData.status || 'pending',
        notes_internal: partData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating part:', error);
      throw error;
    }

    return mapDatabasePartToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(
  partId: string,
  partData: Partial<WorkOrderPart>
): Promise<WorkOrderPart> {
  try {
    const updateFields: any = {};
    
    if (partData.name) updateFields.part_name = partData.name;
    if (partData.part_number) updateFields.part_number = partData.part_number;
    if (partData.description) updateFields.part_description = partData.description;
    if (partData.quantity !== undefined) updateFields.quantity = partData.quantity;
    if (partData.unit_price !== undefined) {
      updateFields.unit_price = partData.unit_price;
      updateFields.customer_price = partData.unit_price;
    }
    if (partData.status) updateFields.status = partData.status;
    if (partData.notes) updateFields.notes_internal = partData.notes;
    if (partData.job_line_id !== undefined) updateFields.job_line_id = partData.job_line_id;
    
    updateFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updateFields)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating part:', error);
      throw error;
    }

    return mapDatabasePartToWorkOrderPart(data);
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
      console.error('Error deleting part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}
