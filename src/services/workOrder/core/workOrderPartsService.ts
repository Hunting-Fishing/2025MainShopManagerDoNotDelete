
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

/**
 * Transform database row to WorkOrderPart interface
 */
const transformDbRowToPart = (dbRow: any): WorkOrderPart => {
  return {
    id: dbRow.id,
    work_order_id: dbRow.work_order_id,
    job_line_id: dbRow.job_line_id,
    part_number: dbRow.part_number || '',
    name: dbRow.part_name || dbRow.name || '',
    description: dbRow.description || '',
    quantity: dbRow.quantity || 1,
    unit_price: dbRow.customer_price || dbRow.unit_price || 0,
    total_price: (dbRow.customer_price || dbRow.unit_price || 0) * (dbRow.quantity || 1),
    status: dbRow.status || 'pending',
    notes: dbRow.notes || '',
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
    
    // Map additional database fields
    part_name: dbRow.part_name,
    customer_price: dbRow.customer_price,
    category: dbRow.category,
    bin_location: dbRow.bin_location,
    part_type: dbRow.part_type,
    core_charge_applied: dbRow.core_charge_applied,
    core_charge_amount: dbRow.core_charge_amount,
    is_taxable: dbRow.is_taxable,
    is_stock_item: dbRow.is_stock_item,
    
    // Aliases for backward compatibility
    partName: dbRow.part_name || dbRow.name,
    partNumber: dbRow.part_number,
    workOrderId: dbRow.work_order_id,
    jobLineId: dbRow.job_line_id
  };
};

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
      // Map WorkOrderPart fields to database schema
      const dbData = {
        work_order_id: partData.work_order_id!,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number || partData.partNumber || '',
        part_name: partData.name || partData.part_name || partData.partName || 'Unnamed Part',
        description: partData.description || '',
        quantity: partData.quantity || 1,
        customer_price: partData.unit_price || partData.customer_price || 0,
        status: partData.status || 'pending',
        notes: partData.notes || '',
        category: partData.category,
        part_type: partData.part_type || partData.partType || 'OEM',
        core_charge_applied: partData.core_charge_applied || partData.coreChargeApplied || false,
        core_charge_amount: partData.core_charge_amount || partData.coreChargeAmount || 0,
        is_taxable: partData.is_taxable ?? partData.isTaxable ?? true,
        is_stock_item: partData.is_stock_item ?? partData.isStockItem ?? true,
        bin_location: partData.bin_location || partData.binLocation
      };

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
      // Map WorkOrderPart fields to database schema
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.part_name = updates.name;
      if (updates.part_name !== undefined) dbUpdates.part_name = updates.part_name;
      if (updates.partName !== undefined) dbUpdates.part_name = updates.partName;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
      if (updates.customer_price !== undefined) dbUpdates.customer_price = updates.customer_price;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.part_type !== undefined) dbUpdates.part_type = updates.part_type;
      if (updates.partType !== undefined) dbUpdates.part_type = updates.partType;
      if (updates.job_line_id !== undefined) dbUpdates.job_line_id = updates.job_line_id;
      if (updates.jobLineId !== undefined) dbUpdates.job_line_id = updates.jobLineId;
      
      dbUpdates.updated_at = new Date().toISOString();

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
