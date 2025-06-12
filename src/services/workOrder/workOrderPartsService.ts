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

    // Map database fields to WorkOrderPart interface with proper price calculations
    return (data || []).map((part: any) => {
      const quantity = part.quantity || 1;
      const unitPrice = part.unit_price || part.customer_price || 0;
      const calculatedTotal = quantity * unitPrice;

      return {
        id: part.id,
        work_order_id: part.work_order_id,
        job_line_id: part.job_line_id,
        part_number: part.part_number,
        name: part.part_name || part.name || 'Unknown Part',
        description: part.description || '',
        quantity: quantity,
        unit_price: unitPrice,
        total_price: part.total_price || calculatedTotal,
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
      };
    });
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    return [];
  }
}

export async function updateWorkOrderPart(partId: string, partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    // Calculate total price if quantity or unit_price is being updated
    const updateData: any = { ...partData };
    if (partData.quantity !== undefined || partData.unit_price !== undefined) {
      const quantity = partData.quantity || 1;
      const unitPrice = partData.unit_price || 0;
      updateData.total_price = quantity * unitPrice;
    }

    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        part_number: updateData.part_number,
        part_name: updateData.name,
        description: updateData.description,
        quantity: updateData.quantity,
        unit_price: updateData.unit_price,
        total_price: updateData.total_price,
        status: updateData.status,
        notes: updateData.notes,
        customer_price: updateData.unit_price,
        supplier_cost: updateData.supplierCost,
        category: updateData.category,
        part_type: updateData.partType,
        updated_at: new Date().toISOString()
      })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    // Return the updated part with proper mapping
    const quantity = data.quantity || 1;
    const unitPrice = data.unit_price || data.customer_price || 0;
    
    return {
      id: data.id,
      work_order_id: data.work_order_id,
      job_line_id: data.job_line_id,
      part_number: data.part_number,
      name: data.part_name || data.name || 'Unknown Part',
      description: data.description || '',
      quantity: quantity,
      unit_price: unitPrice,
      total_price: data.total_price || (quantity * unitPrice),
      status: data.status || 'pending',
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
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
