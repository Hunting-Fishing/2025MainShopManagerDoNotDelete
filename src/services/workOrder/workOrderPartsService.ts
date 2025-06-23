
import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { mapDatabasePartToWorkOrderPart } from '@/utils/databaseMappers';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
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

    if (!data || data.length === 0) {
      console.log('No parts found for work order:', workOrderId);
      return [];
    }

    console.log('Raw parts data from database:', data);

    // Map database records to WorkOrderPart objects
    const mappedParts = data
      .map(dbPart => {
        try {
          return mapDatabasePartToWorkOrderPart(dbPart);
        } catch (error) {
          console.error('Error mapping part:', error, dbPart);
          return null;
        }
      })
      .filter((part): part is WorkOrderPart => part !== null);

    console.log('Successfully fetched and mapped parts:', mappedParts.length);
    return mappedParts;
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(partData: WorkOrderPartFormValues & { work_order_id: string }): Promise<WorkOrderPart> {
  try {
    console.log('Creating work order part:', partData);

    // Map our application data to database format
    const dbPartData = {
      work_order_id: partData.work_order_id,
      job_line_id: partData.job_line_id || null,
      part_name: partData.name, // Database uses part_name, not name
      part_number: partData.part_number,
      description: partData.description || null,
      quantity: partData.quantity,
      customer_price: partData.unit_price, // Database uses customer_price for unit_price
      supplier_cost: partData.supplierCost || null,
      retail_price: partData.retailPrice || null,
      markup_percentage: partData.markupPercentage || null,
      category: partData.category || null,
      part_type: partData.part_type || 'inventory',
      status: partData.status || 'pending',
      notes: partData.notes || null,
      is_taxable: partData.isTaxable || false,
      core_charge_amount: partData.coreChargeAmount || 0,
      core_charge_applied: partData.coreChargeApplied || false,
      warranty_duration: partData.warrantyDuration || null,
      install_date: partData.installDate || null,
      installed_by: partData.installedBy || null,
      invoice_number: partData.invoiceNumber || null,
      po_line: partData.poLine || null,
      is_stock_item: partData.isStockItem || true,
      supplier_name: partData.supplierName || null,
      supplier_order_ref: partData.supplierOrderRef || null,
      notes_internal: partData.notesInternal || null,
      inventory_item_id: partData.inventoryItemId || null,
      estimated_arrival_date: partData.estimatedArrivalDate || null,
      item_status: partData.itemStatus || null
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

    console.log('Successfully created part:', data);
    return mapDatabasePartToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPartFormValues>): Promise<WorkOrderPart> {
  try {
    console.log('Updating work order part:', partId, updates);

    // Map our application data to database format
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.part_name = updates.name;
    if (updates.part_number !== undefined) dbUpdates.part_number = updates.part_number;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
    if (updates.supplierCost !== undefined) dbUpdates.supplier_cost = updates.supplierCost;
    if (updates.retailPrice !== undefined) dbUpdates.retail_price = updates.retailPrice;
    if (updates.markupPercentage !== undefined) dbUpdates.markup_percentage = updates.markupPercentage;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.part_type !== undefined) dbUpdates.part_type = updates.part_type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.job_line_id !== undefined) dbUpdates.job_line_id = updates.job_line_id;
    if (updates.isTaxable !== undefined) dbUpdates.is_taxable = updates.isTaxable;
    if (updates.coreChargeAmount !== undefined) dbUpdates.core_charge_amount = updates.coreChargeAmount;
    if (updates.coreChargeApplied !== undefined) dbUpdates.core_charge_applied = updates.coreChargeApplied;
    if (updates.warrantyDuration !== undefined) dbUpdates.warranty_duration = updates.warrantyDuration;
    if (updates.installDate !== undefined) dbUpdates.install_date = updates.installDate;
    if (updates.installedBy !== undefined) dbUpdates.installed_by = updates.installedBy;
    if (updates.invoiceNumber !== undefined) dbUpdates.invoice_number = updates.invoiceNumber;
    if (updates.poLine !== undefined) dbUpdates.po_line = updates.poLine;
    if (updates.isStockItem !== undefined) dbUpdates.is_stock_item = updates.isStockItem;
    if (updates.supplierName !== undefined) dbUpdates.supplier_name = updates.supplierName;
    if (updates.supplierOrderRef !== undefined) dbUpdates.supplier_order_ref = updates.supplierOrderRef;
    if (updates.notesInternal !== undefined) dbUpdates.notes_internal = updates.notesInternal;
    if (updates.inventoryItemId !== undefined) dbUpdates.inventory_item_id = updates.inventoryItemId;
    if (updates.estimatedArrivalDate !== undefined) dbUpdates.estimated_arrival_date = updates.estimatedArrivalDate;
    if (updates.itemStatus !== undefined) dbUpdates.item_status = updates.itemStatus;

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

    console.log('Successfully updated part:', data);
    return mapDatabasePartToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}

export async function getPartsByJobLine(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
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
      console.log('No parts found for job line:', jobLineId);
      return [];
    }

    // Map database records to WorkOrderPart objects
    const mappedParts = data
      .map(dbPart => {
        try {
          return mapDatabasePartToWorkOrderPart(dbPart);
        } catch (error) {
          console.error('Error mapping part:', error, dbPart);
          return null;
        }
      })
      .filter((part): part is WorkOrderPart => part !== null);

    console.log('Successfully fetched job line parts:', mappedParts.length);
    return mappedParts;
  } catch (error) {
    console.error('Error in getPartsByJobLine:', error);
    throw error;
  }
}
