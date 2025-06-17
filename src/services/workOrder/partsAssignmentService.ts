
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function getUnassignedParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .is('job_line_id', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching unassigned parts:', error);
      throw error;
    }

    // Map database columns to interface properties
    return (data || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number || '',
      name: part.part_name || part.name || '',
      description: part.description || '',
      quantity: part.quantity || 1,
      unit_price: part.customer_price || part.unit_price || 0,
      total_price: (part.customer_price || part.unit_price || 0) * (part.quantity || 1),
      status: part.status || 'pending',
      notes: part.notes || '',
      created_at: part.created_at,
      updated_at: part.updated_at,
      // Include all the additional properties for compatibility
      partName: part.part_name,
      partNumber: part.part_number,
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
      dateAdded: part.created_at,
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
      shelfLocation: part.shelf_location,
      workOrderId: part.work_order_id,
      jobLineId: part.job_line_id
    }));
  } catch (error) {
    console.error('Error in getUnassignedParts:', error);
    throw error;
  }
}

export async function assignPartToJobLine(partId: string, jobLineId: string): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({ job_line_id: jobLineId, updated_at: new Date().toISOString() })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning part to job line:', error);
      throw error;
    }

    // Map the returned data to match the interface
    const part = data;
    return {
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number || '',
      name: part.part_name || part.name || '',
      description: part.description || '',
      quantity: part.quantity || 1,
      unit_price: part.customer_price || part.unit_price || 0,
      total_price: (part.customer_price || part.unit_price || 0) * (part.quantity || 1),
      status: part.status || 'pending',
      notes: part.notes || '',
      created_at: part.created_at,
      updated_at: part.updated_at,
      // Include additional properties
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      customerPrice: part.customer_price,
      category: part.category,
      workOrderId: part.work_order_id,
      jobLineId: part.job_line_id
    };
  } catch (error) {
    console.error('Error in assignPartToJobLine:', error);
    throw error;
  }
}

export async function unassignPart(partId: string): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({ job_line_id: null, updated_at: new Date().toISOString() })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error unassigning part:', error);
      throw error;
    }

    // Map the returned data to match the interface
    const part = data;
    return {
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number || '',
      name: part.part_name || part.name || '',
      description: part.description || '',
      quantity: part.quantity || 1,
      unit_price: part.customer_price || part.unit_price || 0,
      total_price: (part.customer_price || part.unit_price || 0) * (part.quantity || 1),
      status: part.status || 'pending',
      notes: part.notes || '',
      created_at: part.created_at,
      updated_at: part.updated_at,
      // Include additional properties
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      customerPrice: part.customer_price,
      category: part.category,
      workOrderId: part.work_order_id,
      jobLineId: part.job_line_id
    };
  } catch (error) {
    console.error('Error in unassignPart:', error);
    throw error;
  }
}

export async function bulkAssignParts(partIds: string[], jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({ job_line_id: jobLineId, updated_at: new Date().toISOString() })
      .in('id', partIds)
      .select();

    if (error) {
      console.error('Error bulk assigning parts:', error);
      throw error;
    }

    // Map the returned data to match the interface
    return (data || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number || '',
      name: part.part_name || part.name || '',
      description: part.description || '',
      quantity: part.quantity || 1,
      unit_price: part.customer_price || part.unit_price || 0,
      total_price: (part.customer_price || part.unit_price || 0) * (part.quantity || 1),
      status: part.status || 'pending',
      notes: part.notes || '',
      created_at: part.created_at,
      updated_at: part.updated_at,
      // Include additional properties
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      customerPrice: part.customer_price,
      category: part.category,
      workOrderId: part.work_order_id,
      jobLineId: part.job_line_id
    }));
  } catch (error) {
    console.error('Error in bulkAssignParts:', error);
    throw error;
  }
}

export async function getPartAssignmentHistory(partId: string) {
  // This would require a parts history table - placeholder for future implementation
  try {
    const { data, error } = await supabase
      .from('work_order_part_history')
      .select('*')
      .eq('part_id', partId)
      .order('changed_at', { ascending: false });

    if (error && error.code !== 'PGRST116') { // Ignore "relation does not exist" error
      console.error('Error fetching part assignment history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPartAssignmentHistory:', error);
    return [];
  }
}
