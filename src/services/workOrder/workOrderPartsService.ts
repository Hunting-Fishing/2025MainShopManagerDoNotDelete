
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';
import { mapDatabasePartToWorkOrderPart, sanitizePartData } from '@/utils/databaseMappers';

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

    console.log('Raw parts data from database:', data);

    // Map and sanitize each part
    const mappedParts = (data || [])
      .map(part => sanitizePartData(part))
      .filter(part => part !== null) as WorkOrderPart[];

    console.log('Mapped and sanitized parts:', mappedParts);
    return mappedParts;
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    console.log('Creating work order part:', partData);

    // Calculate total price
    const totalPrice = (partData.unit_price || 0) * (partData.quantity || 1);

    const insertData = {
      work_order_id: partData.work_order_id,
      job_line_id: partData.job_line_id || null,
      name: partData.name || '',
      part_number: partData.part_number || '',
      description: partData.description || null,
      quantity: partData.quantity || 1,
      unit_price: partData.unit_price || 0,
      total_price: totalPrice,
      status: partData.status || 'pending',
      part_type: partData.part_type || 'inventory',
      notes: partData.notes || null,
      category: partData.category || null,
      customer_price: partData.customerPrice || partData.unit_price || 0,
      supplier_cost: partData.supplierCost || null,
      retail_price: partData.retailPrice || null,
      markup_percentage: partData.markupPercentage || null,
      supplier_name: partData.supplierName || null,
      is_taxable: partData.isTaxable || true,
      core_charge_amount: partData.coreChargeAmount || null,
      core_charge_applied: partData.coreChargeApplied || false,
      warranty_duration: partData.warrantyDuration || null,
      install_date: partData.installDate || null,
      installed_by: partData.installedBy || null,
      invoice_number: partData.invoiceNumber || null,
      po_line: partData.poLine || null,
      is_stock_item: partData.isStockItem || true,
      supplier_order_ref: partData.supplierOrderRef || null,
      notes_internal: partData.notesInternal || null,
      inventory_item_id: partData.inventoryItemId || null
    };

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw new Error(`Failed to create part: ${error.message}`);
    }

    console.log('Created part data:', data);
    return mapDatabasePartToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    console.log('Updating work order part:', partId, updates);

    // Prepare update data, mapping to database field names
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.part_number !== undefined) updateData.part_number = updates.part_number;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit_price !== undefined) updateData.unit_price = updates.unit_price;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.part_type !== undefined) updateData.part_type = updates.part_type;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.customerPrice !== undefined) updateData.customer_price = updates.customerPrice;
    if (updates.supplierCost !== undefined) updateData.supplier_cost = updates.supplierCost;
    if (updates.supplierName !== undefined) updateData.supplier_name = updates.supplierName;
    if (updates.job_line_id !== undefined) updateData.job_line_id = updates.job_line_id;

    // Recalculate total price if quantity or unit_price changed
    if (updates.quantity !== undefined || updates.unit_price !== undefined) {
      // Get current data to calculate new total
      const { data: currentData } = await supabase
        .from('work_order_parts')
        .select('quantity, unit_price')
        .eq('id', partId)
        .single();

      if (currentData) {
        const newQuantity = updates.quantity !== undefined ? updates.quantity : currentData.quantity;
        const newUnitPrice = updates.unit_price !== undefined ? updates.unit_price : currentData.unit_price;
        updateData.total_price = newQuantity * newUnitPrice;
      }
    }

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updateData)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw new Error(`Failed to update part: ${error.message}`);
    }

    console.log('Updated part data:', data);
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

    // Map and sanitize each part
    const mappedParts = (data || [])
      .map(part => sanitizePartData(part))
      .filter(part => part !== null) as WorkOrderPart[];

    console.log('Job line parts:', mappedParts);
    return mappedParts;
  } catch (error) {
    console.error('Error in getPartsByJobLine:', error);
    throw error;
  }
}

// Alias for backward compatibility
export const getJobLineParts = getPartsByJobLine;
