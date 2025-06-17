
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

/**
 * Transform database row to WorkOrderPart interface
 */
function transformDbRowToPart(dbRow: any): WorkOrderPart {
  return {
    id: dbRow.id,
    work_order_id: dbRow.work_order_id,
    job_line_id: dbRow.job_line_id,
    part_number: dbRow.part_number,
    name: dbRow.part_name || dbRow.name || 'Unknown Part',
    description: dbRow.description || '',
    quantity: dbRow.quantity || 1,
    unit_price: dbRow.customer_price || dbRow.unit_price || 0,
    total_price: (dbRow.quantity || 1) * (dbRow.customer_price || dbRow.unit_price || 0),
    status: dbRow.status || 'pending',
    notes: dbRow.notes || '',
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
    
    // Map additional fields
    customer_price: dbRow.customer_price,
    customerPrice: dbRow.customer_price,
    part_name: dbRow.part_name,
    partName: dbRow.part_name || dbRow.name,
    partNumber: dbRow.part_number,
    category: dbRow.category,
    bin_location: dbRow.bin_location || '',
    binLocation: dbRow.bin_location,
    part_type: dbRow.part_type,
    partType: dbRow.part_type,
    core_charge_applied: dbRow.core_charge_applied,
    coreChargeApplied: dbRow.core_charge_applied,
    core_charge_amount: dbRow.core_charge_amount,
    coreChargeAmount: dbRow.core_charge_amount,
    is_taxable: dbRow.is_taxable,
    isTaxable: dbRow.is_taxable,
    is_stock_item: dbRow.is_stock_item,
    isStockItem: dbRow.is_stock_item,
    workOrderId: dbRow.work_order_id,
    jobLineId: dbRow.job_line_id
  };
}

/**
 * Transform WorkOrderPart to database format
 */
function transformPartToDbFormat(part: Partial<WorkOrderPart>) {
  return {
    work_order_id: part.work_order_id,
    job_line_id: part.job_line_id,
    part_number: part.part_number,
    part_name: part.name || part.part_name || part.partName,
    description: part.description,
    quantity: part.quantity,
    customer_price: part.unit_price || part.customer_price || part.customerPrice,
    status: part.status,
    notes: part.notes,
    category: part.category,
    bin_location: part.bin_location || part.binLocation,
    part_type: part.part_type || part.partType,
    core_charge_applied: part.core_charge_applied ?? part.coreChargeApplied,
    core_charge_amount: part.core_charge_amount ?? part.coreChargeAmount,
    is_taxable: part.is_taxable ?? part.isTaxable,
    is_stock_item: part.is_stock_item ?? part.isStockItem
  };
}

/**
 * Work order parts service
 */
export const workOrderPartsService = {
  /**
   * Get all parts for a work order
   */
  async getByWorkOrderId(workOrderId: string): Promise<WorkOrderPart[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformDbRowToPart);
    } catch (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }
  },

  /**
   * Get parts by job line ID
   */
  async getByJobLineId(jobLineId: string): Promise<WorkOrderPart[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('job_line_id', jobLineId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformDbRowToPart);
    } catch (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }
  },

  /**
   * Create new part
   */
  async create(partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
    try {
      const dbData = transformPartToDbFormat(partData);

      const { data, error } = await supabase
        .from('work_order_parts')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return transformDbRowToPart(data);
    } catch (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }
  },

  /**
   * Update part
   */
  async update(id: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
    try {
      const dbUpdates = transformPartToDbFormat(updates);
      
      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      // Add updated timestamp
      (dbUpdates as any).updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('work_order_parts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDbRowToPart(data);
    } catch (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }
  },

  /**
   * Delete part
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_order_parts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }
  }
};
