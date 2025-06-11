
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

/**
 * Get parts for a specific job line
 */
export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    console.log('getJobLineParts: Fetching parts for job line:', jobLineId);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('getJobLineParts: Error:', error);
      throw error;
    }

    console.log('getJobLineParts: Successfully fetched parts:', data?.length || 0);
    
    // Map database fields to interface
    return (data || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number,
      name: part.name || part.part_name || '',
      description: part.description,
      quantity: part.quantity,
      unit_price: part.unit_price || part.customer_price || 0,
      total_price: part.total_price || (part.quantity * (part.unit_price || part.customer_price || 0)),
      status: part.status,
      notes: part.notes,
      created_at: part.created_at,
      updated_at: part.updated_at,
      // Map additional fields
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
      customerPrice: part.customer_price,
      retailPrice: part.retail_price,
      category: part.category,
      warrantyDuration: part.warranty_duration,
      warrantyExpiryDate: part.warranty_expiry_date,
      binLocation: part.bin_location,
      installDate: part.install_date,
      partType: part.part_type,
      installedBy: part.installed_by,
      markupPercentage: part.markup_percentage,
      inventoryItemId: part.inventory_item_id,
      coreChargeApplied: part.core_charge_applied,
      coreChargeAmount: part.core_charge_amount,
      isTaxable: part.is_taxable,
      invoiceNumber: part.invoice_number,
      poLine: part.po_line,
      isStockItem: part.is_stock_item,
      notesInternal: part.notes_internal,
      attachments: part.attachments,
      warehouseLocation: part.warehouse_location,
      shelfLocation: part.shelf_location
    }));
  } catch (error) {
    console.error('getJobLineParts: Failed to fetch parts:', error);
    return [];
  }
}

/**
 * Get all parts for a work order
 */
export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    console.log('getWorkOrderParts: Fetching parts for work order:', workOrderId);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('getWorkOrderParts: Error:', error);
      throw error;
    }

    console.log('getWorkOrderParts: Successfully fetched parts:', data?.length || 0);
    
    // Map database fields to interface
    return (data || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number,
      name: part.name || part.part_name || '',
      description: part.description,
      quantity: part.quantity,
      unit_price: part.unit_price || part.customer_price || 0,
      total_price: part.total_price || (part.quantity * (part.unit_price || part.customer_price || 0)),
      status: part.status,
      notes: part.notes,
      created_at: part.created_at,
      updated_at: part.updated_at,
      // Map additional fields
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
      customerPrice: part.customer_price,
      retailPrice: part.retail_price,
      category: part.category,
      warrantyDuration: part.warranty_duration,
      warrantyExpiryDate: part.warranty_expiry_date,
      binLocation: part.bin_location,
      installDate: part.install_date,
      partType: part.part_type,
      installedBy: part.installed_by,
      markupPercentage: part.markup_percentage,
      inventoryItemId: part.inventory_item_id,
      coreChargeApplied: part.core_charge_applied,
      coreChargeAmount: part.core_charge_amount,
      isTaxable: part.is_taxable,
      invoiceNumber: part.invoice_number,
      poLine: part.po_line,
      isStockItem: part.is_stock_item,
      notesInternal: part.notes_internal,
      attachments: part.attachments,
      warehouseLocation: part.warehouse_location,
      shelfLocation: part.shelf_location
    }));
  } catch (error) {
    console.error('getWorkOrderParts: Failed to fetch parts:', error);
    return [];
  }
}

/**
 * Create or update a work order part
 */
export async function upsertWorkOrderPart(part: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    console.log('upsertWorkOrderPart: Upserting part:', part);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .upsert({
        id: part.id,
        work_order_id: part.work_order_id,
        job_line_id: part.job_line_id,
        part_number: part.part_number,
        name: part.name,
        description: part.description,
        quantity: part.quantity,
        unit_price: part.unit_price,
        total_price: part.total_price || (part.quantity || 0) * (part.unit_price || 0),
        status: part.status || 'pending',
        notes: part.notes
      })
      .select()
      .single();

    if (error) {
      console.error('upsertWorkOrderPart: Error:', error);
      throw error;
    }

    console.log('upsertWorkOrderPart: Successfully upserted part:', data);
    
    // Map response back to interface
    return {
      id: data.id,
      work_order_id: data.work_order_id,
      job_line_id: data.job_line_id,
      part_number: data.part_number,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unit_price: data.unit_price,
      total_price: data.total_price,
      status: data.status,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('upsertWorkOrderPart: Failed to upsert part:', error);
    throw error;
  }
}

/**
 * Save a work order part (alias for upsertWorkOrderPart)
 */
export const saveWorkOrderPart = upsertWorkOrderPart;

/**
 * Delete a work order part
 */
export async function deleteWorkOrderPart(partId: string): Promise<void> {
  try {
    console.log('deleteWorkOrderPart: Deleting part:', partId);
    
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('deleteWorkOrderPart: Error:', error);
      throw error;
    }

    console.log('deleteWorkOrderPart: Successfully deleted part');
  } catch (error) {
    console.error('deleteWorkOrderPart: Failed to delete part:', error);
    throw error;
  }
}
