
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  console.log('Fetching parts for work order:', workOrderId);
  
  try {
    const { data: parts, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw new Error(`Failed to fetch work order parts: ${error.message}`);
    }

    console.log('Work order parts fetched successfully:', parts?.length || 0);
    
    // Map database fields to WorkOrderPart interface
    const mappedParts: WorkOrderPart[] = (parts || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number || part.part_name || '',
      name: part.part_name || part.name || '',
      description: part.description,
      quantity: part.quantity || 1,
      unit_price: part.customer_price || part.unit_price || 0,
      total_price: part.customer_price * part.quantity || part.total_price || 0,
      status: part.status || 'pending',
      notes: part.notes,
      created_at: part.created_at,
      updated_at: part.updated_at,
      
      // Additional mapped fields
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      customerPrice: part.customer_price,
      retailPrice: part.retail_price,
      category: part.category,
      partType: part.part_type,
      installedBy: part.installed_by,
      markupPercentage: part.markup_percentage,
      isTaxable: part.is_taxable,
      coreChargeApplied: part.core_charge_applied,
      coreChargeAmount: part.core_charge_amount,
      warrantyDuration: part.warranty_duration,
      installDate: part.install_date,
      invoiceNumber: part.invoice_number,
      poLine: part.po_line,
      isStockItem: part.is_stock_item,
    }));

    return mappedParts;

  } catch (error) {
    console.error('Exception in getWorkOrderParts:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  console.log('Fetching parts for job line:', jobLineId);
  
  try {
    const { data: parts, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw new Error(`Failed to fetch job line parts: ${error.message}`);
    }

    console.log('Job line parts fetched successfully:', parts?.length || 0);
    
    // Map database fields to WorkOrderPart interface (same mapping as above)
    const mappedParts: WorkOrderPart[] = (parts || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number || part.part_name || '',
      name: part.part_name || part.name || '',
      description: part.description,
      quantity: part.quantity || 1,
      unit_price: part.customer_price || part.unit_price || 0,
      total_price: part.customer_price * part.quantity || part.total_price || 0,
      status: part.status || 'pending',
      notes: part.notes,
      created_at: part.created_at,
      updated_at: part.updated_at,
      
      // Additional mapped fields
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      customerPrice: part.customer_price,
      retailPrice: part.retail_price,
      category: part.category,
      partType: part.part_type,
      installedBy: part.installed_by,
      markupPercentage: part.markup_percentage,
      isTaxable: part.is_taxable,
      coreChargeApplied: part.core_charge_applied,
      coreChargeAmount: part.core_charge_amount,
      warrantyDuration: part.warranty_duration,
      installDate: part.install_date,
      invoiceNumber: part.invoice_number,
      poLine: part.po_line,
      isStockItem: part.is_stock_item,
    }));

    return mappedParts;

  } catch (error) {
    console.error('Exception in getJobLineParts:', error);
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
      throw new Error(`Failed to delete work order part: ${error.message}`);
    }

    console.log('Work order part deleted successfully');

  } catch (error) {
    console.error('Exception in deleteWorkOrderPart:', error);
    throw error;
  }
}
