
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

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

    // Transform database records to match our TypeScript interface
    return (data || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number,
      name: part.part_name || part.name || '',
      description: part.description || '',
      quantity: part.quantity,
      unit_price: part.unit_price,
      total_price: part.total_price,
      status: part.status,
      notes: part.notes,
      created_at: part.created_at,
      updated_at: part.updated_at,
      // Additional fields with safe fallbacks
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      customerPrice: part.customer_price,
      category: part.category,
      warrantyDuration: part.warranty_duration,
      warrantyExpiryDate: part.warranty_expiry_date,
      installDate: part.install_date,
      dateAdded: part.date_added,
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
      attachments: part.attachments
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
      .eq('job_line_id', jobLineId);

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    // Transform database records to match our TypeScript interface
    return (data || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number,
      name: part.part_name || part.name || '',
      description: part.description || '',
      quantity: part.quantity,
      unit_price: part.unit_price,
      total_price: part.total_price,
      status: part.status,
      notes: part.notes,
      created_at: part.created_at,
      updated_at: part.updated_at,
      // Additional fields with safe fallbacks
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      customerPrice: part.customer_price,
      category: part.category,
      warrantyDuration: part.warranty_duration,
      warrantyExpiryDate: part.warranty_expiry_date,
      installDate: part.install_date,
      dateAdded: part.date_added,
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
      attachments: part.attachments
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
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number,
        part_name: partData.name,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        total_price: partData.quantity * partData.unit_price,
        status: partData.status || 'pending',
        notes: partData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    return {
      id: data.id,
      work_order_id: data.work_order_id,
      job_line_id: data.job_line_id,
      part_number: data.part_number,
      name: data.part_name || '',
      description: data.description || '',
      quantity: data.quantity,
      unit_price: data.unit_price,
      total_price: data.total_price,
      status: data.status,
      notes: data.notes,
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
  partData: Partial<WorkOrderPart>
): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        part_number: partData.part_number,
        part_name: partData.name,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        total_price: partData.total_price,
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

    return {
      id: data.id,
      work_order_id: data.work_order_id,
      job_line_id: data.job_line_id,
      part_number: data.part_number,
      name: data.part_name || '',
      description: data.description || '',
      quantity: data.quantity,
      unit_price: data.unit_price,
      total_price: data.total_price,
      status: data.status,
      notes: data.notes,
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
