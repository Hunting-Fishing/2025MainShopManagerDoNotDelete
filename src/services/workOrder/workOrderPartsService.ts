
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';
import { mapDatabasePartToWorkOrderPart } from '@/utils/databaseMappers';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  console.log('Fetching parts for work order:', workOrderId);
  
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No parts found for work order:', workOrderId);
      return [];
    }

    console.log('Raw parts data from database:', data);

    // Map database records to application format
    const mappedParts = data.map(part => {
      try {
        return mapDatabasePartToWorkOrderPart(part);
      } catch (error) {
        console.error('Error mapping part:', part, error);
        return null;
      }
    }).filter(Boolean) as WorkOrderPart[];

    console.log('Mapped parts:', mappedParts);
    return mappedParts;
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  console.log('Fetching parts for job line:', jobLineId);
  
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

    if (!data || data.length === 0) {
      console.log('No parts found for job line:', jobLineId);
      return [];
    }

    // Map database records to application format
    const mappedParts = data.map(part => {
      try {
        return mapDatabasePartToWorkOrderPart(part);
      } catch (error) {
        console.error('Error mapping part:', part, error);
        return null;
      }
    }).filter(Boolean) as WorkOrderPart[];

    console.log('Mapped job line parts:', mappedParts);
    return mappedParts;
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}

export async function getPartsByJobLine(jobLineId: string): Promise<WorkOrderPart[]> {
  // Alias for getJobLineParts for backward compatibility
  return getJobLineParts(jobLineId);
}

export async function createWorkOrderPart(partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  console.log('Creating work order part:', partData);
  
  try {
    // Helper function to handle date fields - convert empty strings to null
    const formatDateField = (dateValue: any): string | null => {
      if (!dateValue || dateValue === '' || dateValue === 'null' || dateValue === 'undefined') {
        return null;
      }
      return dateValue;
    };

    // Helper function to handle numeric fields - ensure proper type conversion
    const formatNumericField = (numValue: any): number | null => {
      if (numValue === undefined || numValue === null || numValue === '' || isNaN(Number(numValue))) {
        return null;
      }
      return Number(numValue);
    };

    // Map application data to database format with proper data validation
    const dbPartData = {
      work_order_id: partData.work_order_id,
      job_line_id: partData.job_line_id || null,
      part_name: partData.name, // Map name to part_name
      part_number: partData.part_number,
      quantity: partData.quantity || 1,
      customer_price: partData.unit_price || partData.customerPrice || 0, // Map unit_price to customer_price
      status: partData.status || 'pending',
      part_type: partData.part_type || 'inventory',
      category: partData.category || null,
      notes: partData.notes || null,
      // Extended fields with proper null handling
      supplier_cost: formatNumericField(partData.supplierCost),
      retail_price: formatNumericField(partData.supplierSuggestedRetail), // Use retail_price column
      markup_percentage: formatNumericField(partData.markupPercentage),
      supplier_name: partData.supplierName || null,
      is_taxable: partData.isTaxable !== undefined ? partData.isTaxable : true,
      core_charge_amount: formatNumericField(partData.coreChargeAmount),
      core_charge_applied: partData.coreChargeApplied !== undefined ? partData.coreChargeApplied : false,
      warranty_duration: partData.warrantyDuration || null,
      warranty_expiry_date: formatDateField(partData.warrantyExpiryDate),
      install_date: formatDateField(partData.installDate),
      installed_by: partData.installedBy || null,
      invoice_number: partData.invoiceNumber || null,
      po_line: partData.poLine || null,
      is_stock_item: partData.isStockItem !== undefined ? partData.isStockItem : true,
      inventory_item_id: partData.inventoryItemId || null
    };

    console.log('Mapped database part data:', dbPartData);

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert(dbPartData)
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    console.log('Work order part created successfully:', data);
    
    // Map the created part back to application format
    return mapDatabasePartToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  console.log('Updating work order part:', partId, updates);
  
  try {
    // Helper function to handle date fields - convert empty strings to null
    const formatDateField = (dateValue: any): string | null => {
      if (!dateValue || dateValue === '' || dateValue === 'null' || dateValue === 'undefined') {
        return null;
      }
      return dateValue;
    };

    // Helper function to handle numeric fields - ensure proper type conversion
    const formatNumericField = (numValue: any): number | null => {
      if (numValue === undefined || numValue === null || numValue === '' || isNaN(Number(numValue))) {
        return null;
      }
      return Number(numValue);
    };

    // Map application data to database format with proper data validation
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.part_name = updates.name;
    if (updates.part_number !== undefined) dbUpdates.part_number = updates.part_number;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.part_type !== undefined) dbUpdates.part_type = updates.part_type;
    if (updates.job_line_id !== undefined) dbUpdates.job_line_id = updates.job_line_id;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.category !== undefined) dbUpdates.category = updates.category || null;

    // Extended fields with proper null handling
    if (updates.supplierCost !== undefined) dbUpdates.supplier_cost = formatNumericField(updates.supplierCost);
    if (updates.supplierSuggestedRetail !== undefined) dbUpdates.retail_price = formatNumericField(updates.supplierSuggestedRetail);
    if (updates.markupPercentage !== undefined) dbUpdates.markup_percentage = formatNumericField(updates.markupPercentage);
    if (updates.supplierName !== undefined) dbUpdates.supplier_name = updates.supplierName || null;
    if (updates.isTaxable !== undefined) dbUpdates.is_taxable = updates.isTaxable;
    if (updates.warrantyDuration !== undefined) dbUpdates.warranty_duration = updates.warrantyDuration || null;
    if (updates.warrantyExpiryDate !== undefined) dbUpdates.warranty_expiry_date = formatDateField(updates.warrantyExpiryDate);
    if (updates.installDate !== undefined) dbUpdates.install_date = formatDateField(updates.installDate);
    if (updates.installedBy !== undefined) dbUpdates.installed_by = updates.installedBy || null;
    if (updates.invoiceNumber !== undefined) dbUpdates.invoice_number = updates.invoiceNumber || null;
    if (updates.poLine !== undefined) dbUpdates.po_line = updates.poLine || null;
    if (updates.coreChargeAmount !== undefined) dbUpdates.core_charge_amount = formatNumericField(updates.coreChargeAmount);
    if (updates.coreChargeApplied !== undefined) dbUpdates.core_charge_applied = updates.coreChargeApplied;
    if (updates.isStockItem !== undefined) dbUpdates.is_stock_item = updates.isStockItem;
    if (updates.inventoryItemId !== undefined) dbUpdates.inventory_item_id = updates.inventoryItemId || null;

    console.log('Update data being sent to database:', dbUpdates);

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(dbUpdates)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    console.log('Work order part updated successfully:', data);
    
    // Map the updated part back to application format
    return mapDatabasePartToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  console.log('Deleting work order part:', partId);
  
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }

    console.log('Work order part deleted successfully:', partId);
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}
