
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
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

    // Transform database data to match our WorkOrderPart type
    return (data || []).map(item => ({
      id: item.id,
      work_order_id: item.work_order_id,
      job_line_id: item.job_line_id,
      part_number: item.part_number || '',
      name: item.part_name || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      unit_price: item.customer_price || 0,
      total_price: (item.customer_price || 0) * (item.quantity || 0),
      status: item.status || 'pending',
      notes: item.notes || '',
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Additional properties
      partName: item.part_name,
      partNumber: item.part_number,
      supplierName: item.supplier_name,
      supplierCost: item.supplier_cost,
      customerPrice: item.customer_price,
      retailPrice: item.retail_price,
      category: item.category,
      partType: item.part_type,
      markupPercentage: item.markup_percentage,
      isTaxable: item.is_taxable,
      coreChargeAmount: item.core_charge_amount,
      coreChargeApplied: item.core_charge_applied,
      warrantyDuration: item.warranty_duration,
      invoiceNumber: item.invoice_number,
      poLine: item.po_line,
      isStockItem: item.is_stock_item,
      notesInternal: item.notes_internal,
      binLocation: item.bin_location,
      installDate: item.install_date,
      installedBy: item.installed_by,
      inventoryItemId: item.inventory_item_id,
      attachments: item.attachments,
      warehouseLocation: item.warehouse_location,
      shelfLocation: item.shelf_location
    }));
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

    // Transform database data to match our WorkOrderPart type
    return (data || []).map(item => ({
      id: item.id,
      work_order_id: item.work_order_id,
      job_line_id: item.job_line_id,
      part_number: item.part_number || '',
      name: item.part_name || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      unit_price: item.customer_price || 0,
      total_price: (item.customer_price || 0) * (item.quantity || 0),
      status: item.status || 'pending',
      notes: item.notes || '',
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Additional properties
      partName: item.part_name,
      partNumber: item.part_number,
      supplierName: item.supplier_name,
      supplierCost: item.supplier_cost,
      customerPrice: item.customer_price,
      retailPrice: item.retail_price,
      category: item.category,
      partType: item.part_type,
      markupPercentage: item.markup_percentage,
      isTaxable: item.is_taxable,
      coreChargeAmount: item.core_charge_amount,
      coreChargeApplied: item.core_charge_applied,
      warrantyDuration: item.warranty_duration,
      invoiceNumber: item.invoice_number,
      poLine: item.po_line,
      isStockItem: item.is_stock_item,
      notesInternal: item.notes_internal,
      binLocation: item.bin_location,
      installDate: item.install_date,
      installedBy: item.installed_by,
      inventoryItemId: item.inventory_item_id,
      attachments: item.attachments,
      warehouseLocation: item.warehouse_location,
      shelfLocation: item.shelf_location
    }));
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
    const totalPrice = partData.quantity * partData.unit_price;
    
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
        notes: partData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    // Transform response to match our type
    return {
      id: data.id,
      work_order_id: data.work_order_id,
      job_line_id: data.job_line_id,
      part_number: data.part_number || '',
      name: data.part_name || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      unit_price: data.customer_price || 0,
      total_price: totalPrice,
      status: data.status || 'pending',
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(
  partId: string,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  try {
    const totalPrice = partData.quantity * partData.unit_price;
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        part_number: partData.part_number,
        part_name: partData.name,
        description: partData.description,
        quantity: partData.quantity,
        customer_price: partData.unit_price,
        status: partData.status,
        notes: partData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    // Transform response to match our type
    return {
      id: data.id,
      work_order_id: data.work_order_id,
      job_line_id: data.job_line_id,
      part_number: data.part_number || '',
      name: data.part_name || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      unit_price: data.customer_price || 0,
      total_price: totalPrice,
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
