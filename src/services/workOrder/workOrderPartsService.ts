
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId);

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    // Map database fields to WorkOrderPart interface
    return (data || []).map((part: any) => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number,
      name: part.part_name || part.name || 'Unknown Part',
      description: part.description || '',
      quantity: part.quantity || 1,
      unit_price: part.unit_price || part.customer_price || 0,
      total_price: part.total_price || (part.unit_price * part.quantity) || 0,
      status: part.status || 'pending',
      notes: part.notes || '',
      created_at: part.created_at,
      updated_at: part.updated_at,
      
      // Additional fields that may exist
      category: part.category,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
      customerPrice: part.customer_price,
      retailPrice: part.retail_price,
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
    console.error('Error in getWorkOrderParts:', error);
    return [];
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId);

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    // Map database fields to WorkOrderPart interface - same mapping as above
    return (data || []).map((part: any) => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number,
      name: part.part_name || part.name || 'Unknown Part',
      description: part.description || '',
      quantity: part.quantity || 1,
      unit_price: part.unit_price || part.customer_price || 0,
      total_price: part.total_price || (part.unit_price * part.quantity) || 0,
      status: part.status || 'pending',
      notes: part.notes || '',
      created_at: part.created_at,
      updated_at: part.updated_at,
      
      // Additional fields
      category: part.category,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
      customerPrice: part.customer_price,
      retailPrice: part.retail_price,
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
    console.error('Error in getJobLineParts:', error);
    return [];
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
