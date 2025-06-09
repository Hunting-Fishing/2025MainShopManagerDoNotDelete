
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function loadJobLinesFromDatabase(workOrderId: string): Promise<WorkOrderJobLine[]> {
  try {
    // First, get the job lines
    const { data: jobLinesData, error: jobLinesError } = await supabase
      .rpc('get_work_order_job_lines', {
        work_order_id_param: workOrderId
      });

    if (jobLinesError) throw jobLinesError;

    // Then get all parts for this work order
    const { data: partsData, error: partsError } = await supabase
      .rpc('get_work_order_parts', {
        work_order_id_param: workOrderId
      });

    if (partsError) throw partsError;

    // Map parts by job line ID
    const partsByJobLine: { [key: string]: WorkOrderPart[] } = {};
    (partsData || []).forEach((part: any) => {
      if (part.job_line_id) {
        if (!partsByJobLine[part.job_line_id]) {
          partsByJobLine[part.job_line_id] = [];
        }
        partsByJobLine[part.job_line_id].push({
          id: part.id,
          workOrderId: part.work_order_id,
          jobLineId: part.job_line_id,
          inventoryItemId: part.inventory_item_id,
          partName: part.part_name,
          partNumber: part.part_number,
          supplierName: part.supplier_name,
          supplierCost: part.supplier_cost,
          supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
          markupPercentage: part.markup_percentage,
          retailPrice: part.retail_price,
          customerPrice: part.customer_price,
          quantity: part.quantity,
          partType: part.part_type as 'inventory' | 'non-inventory',
          invoiceNumber: part.invoice_number,
          poLine: part.po_line,
          notes: part.notes,
          category: part.category,
          isTaxable: part.is_taxable,
          coreChargeAmount: part.core_charge_amount,
          coreChargeApplied: part.core_charge_applied,
          warrantyDuration: part.warranty_duration,
          warrantyExpiryDate: part.warranty_expiry_date,
          installDate: part.install_date,
          installedBy: part.installed_by,
          status: part.status,
          isStockItem: part.is_stock_item,
          dateAdded: part.created_at,
          attachments: part.attachments || [],
          notesInternal: part.notes_internal,
          createdAt: part.created_at,
          updatedAt: part.updated_at
        });
      }
    });

    // Map job lines and attach their parts
    return (jobLinesData || []).map((item: any): WorkOrderJobLine => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      description: item.description,
      estimatedHours: item.estimated_hours,
      laborRate: item.labor_rate,
      totalAmount: item.total_amount,
      status: item.status as WorkOrderJobLine['status'],
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      parts: partsByJobLine[item.id] || []
    }));
  } catch (error) {
    console.error('Error loading job lines with parts from database:', error);
    throw new Error('Failed to load job lines with parts from database');
  }
}

export async function saveJobLinesToDatabase(workOrderId: string, jobLines: WorkOrderJobLine[]): Promise<void> {
  try {
    // First, delete existing job lines for this work order
    const { error: deleteError } = await supabase.rpc('delete_work_order_job_lines', {
      work_order_id_param: workOrderId
    });

    if (deleteError) throw deleteError;

    // Then insert all the new job lines
    for (let i = 0; i < jobLines.length; i++) {
      const jobLine = jobLines[i];
      const { error } = await supabase.rpc('upsert_work_order_job_line', {
        p_id: jobLine.id,
        p_work_order_id: workOrderId,
        p_name: jobLine.name,
        p_category: jobLine.category || null,
        p_subcategory: jobLine.subcategory || null,
        p_description: jobLine.description || null,
        p_estimated_hours: jobLine.estimatedHours || 0,
        p_labor_rate: jobLine.laborRate || 0,
        p_total_amount: jobLine.totalAmount || 0,
        p_status: jobLine.status,
        p_notes: jobLine.notes || null,
        p_display_order: i
      });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving job lines to database:', error);
    throw new Error('Failed to save job lines to database');
  }
}

export async function deleteJobLineFromDatabase(jobLineId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('delete_work_order_job_line', {
      job_line_id_param: jobLineId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting job line from database:', error);
    throw new Error('Failed to delete job line from database');
  }
}
