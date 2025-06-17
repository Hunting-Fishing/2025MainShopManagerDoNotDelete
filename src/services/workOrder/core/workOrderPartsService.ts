
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

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
      
      // Map database fields to our TypeScript interface
      return (data || []).map(item => ({
        id: item.id,
        work_order_id: item.work_order_id,
        job_line_id: item.job_line_id,
        part_number: item.part_number || item.part_name || '',
        name: item.part_name || item.name || 'Unnamed Part',
        description: item.description,
        quantity: item.quantity || 1,
        unit_price: item.customer_price || item.unit_price || 0,
        total_price: (item.customer_price || item.unit_price || 0) * (item.quantity || 1),
        status: item.status,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Map additional fields
        category: item.category,
        partType: item.part_type,
        supplierName: item.supplier_name,
        supplierCost: item.supplier_cost,
        retailPrice: item.retail_price,
        markupPercentage: item.markup_percentage,
        isTaxable: item.is_taxable,
        coreChargeAmount: item.core_charge_amount,
        coreChargeApplied: item.core_charge_applied,
        warrantyDuration: item.warranty_duration,
        binLocation: item.bin_location,
        installDate: item.install_date,
        installedBy: item.installed_by
      }));
    } catch (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }
  },

  /**
   * Get parts for a specific job line
   */
  async getByJobLineId(jobLineId: string): Promise<WorkOrderPart[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('job_line_id', jobLineId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Map database fields to our TypeScript interface
      return (data || []).map(item => ({
        id: item.id,
        work_order_id: item.work_order_id,
        job_line_id: item.job_line_id,
        part_number: item.part_number || item.part_name || '',
        name: item.part_name || item.name || 'Unnamed Part',
        description: item.description,
        quantity: item.quantity || 1,
        unit_price: item.customer_price || item.unit_price || 0,
        total_price: (item.customer_price || item.unit_price || 0) * (item.quantity || 1),
        status: item.status,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
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
      // Map our interface to database schema
      const dbData = {
        work_order_id: partData.work_order_id!,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number || '',
        part_name: partData.name || 'Unnamed Part',
        name: partData.name || 'Unnamed Part',
        description: partData.description,
        quantity: partData.quantity || 1,
        unit_price: partData.unit_price || 0,
        customer_price: partData.unit_price || 0,
        part_type: partData.partType || 'OEM',
        status: partData.status || 'pending',
        notes: partData.notes,
        category: partData.category,
        supplier_name: partData.supplierName,
        supplier_cost: partData.supplierCost,
        retail_price: partData.retailPrice,
        markup_percentage: partData.markupPercentage,
        is_taxable: partData.isTaxable || false,
        core_charge_amount: partData.coreChargeAmount || 0,
        core_charge_applied: partData.coreChargeApplied || false,
        warranty_duration: partData.warrantyDuration,
        bin_location: partData.binLocation,
        install_date: partData.installDate,
        installed_by: partData.installedBy
      };

      const { data, error } = await supabase
        .from('work_order_parts')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      
      // Map response back to our interface
      return {
        id: data.id,
        work_order_id: data.work_order_id,
        job_line_id: data.job_line_id,
        part_number: data.part_number,
        name: data.part_name || data.name,
        description: data.description,
        quantity: data.quantity,
        unit_price: data.customer_price || data.unit_price,
        total_price: data.customer_price * data.quantity,
        status: data.status,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
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
      // Map our interface to database schema
      const dbUpdates = {
        part_number: updates.part_number,
        part_name: updates.name,
        name: updates.name,
        description: updates.description,
        quantity: updates.quantity,
        unit_price: updates.unit_price,
        customer_price: updates.unit_price,
        part_type: updates.partType,
        status: updates.status,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      const { data, error } = await supabase
        .from('work_order_parts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Map response back to our interface
      return {
        id: data.id,
        work_order_id: data.work_order_id,
        job_line_id: data.job_line_id,
        part_number: data.part_number,
        name: data.part_name || data.name,
        description: data.description,
        quantity: data.quantity,
        unit_price: data.customer_price || data.unit_price,
        total_price: (data.customer_price || data.unit_price) * data.quantity,
        status: data.status,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
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
