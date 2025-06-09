import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function loadJobLinesFromDatabase(workOrderId: string): Promise<WorkOrderJobLine[]> {
  try {
    const { data, error } = await supabase.rpc('get_work_order_job_lines_with_parts', {
      work_order_id_param: workOrderId
    });

    if (error) throw error;

    return (data || []).map((item: any): WorkOrderJobLine => {
      // Parse parts from jsonb
      const parts: WorkOrderPart[] = Array.isArray(item.parts) ? item.parts.map((part: any) => ({
        id: part.id,
        workOrderId: part.workOrderId,
        jobLineId: part.jobLineId,
        inventoryItemId: part.inventoryItemId,
        partName: part.partName,
        partNumber: part.partNumber,
        supplierName: part.supplierName,
        supplierCost: part.supplierCost,
        supplierSuggestedRetailPrice: part.supplierSuggestedRetailPrice,
        markupPercentage: part.markupPercentage,
        retailPrice: part.retailPrice,
        customerPrice: part.customerPrice,
        quantity: part.quantity,
        partType: part.partType as 'inventory' | 'non-inventory',
        invoiceNumber: part.invoiceNumber,
        poLine: part.poLine,
        notes: part.notes,
        category: part.category,
        isTaxable: part.isTaxable,
        coreChargeAmount: part.coreChargeAmount,
        coreChargeApplied: part.coreChargeApplied,
        warrantyDuration: part.warrantyDuration,
        warrantyExpiryDate: part.warrantyExpiryDate,
        installDate: part.installDate,
        installedBy: part.installedBy,
        status: part.status,
        isStockItem: part.isStockItem,
        dateAdded: part.dateAdded,
        attachments: part.attachments || [],
        notesInternal: part.notesInternal,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt
      })) : [];

      return {
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
        parts: parts
      };
    });
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
