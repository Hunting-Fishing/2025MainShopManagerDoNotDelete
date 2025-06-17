
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { normalizeWorkOrder } from '@/utils/workOrders/formatters';

/**
 * Core work order CRUD operations
 */
export const workOrderCoreService = {
  /**
   * Get all work orders with enhanced data
   */
  async getAll(): Promise<WorkOrder[]> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers!customer_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            address
          ),
          vehicles!vehicle_id (
            id,
            make,
            model,
            year,
            license_plate,
            vin
          ),
          profiles!technician_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(normalizeWorkOrder);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }
  },

  /**
   * Get work order by ID with all related data
   */
  async getById(id: string): Promise<WorkOrder | null> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers!customer_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            address
          ),
          vehicles!vehicle_id (
            id,
            make,
            model,
            year,
            license_plate,
            vin
          ),
          profiles!technician_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? normalizeWorkOrder(data) : null;
    } catch (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }
  },

  /**
   * Create new work order
   */
  async create(workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .insert(workOrderData)
        .select()
        .single();

      if (error) throw error;
      return normalizeWorkOrder(data);
    } catch (error) {
      console.error('Error creating work order:', error);
      throw error;
    }
  },

  /**
   * Update work order
   */
  async update(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return normalizeWorkOrder(data);
    } catch (error) {
      console.error('Error updating work order:', error);
      throw error;
    }
  },

  /**
   * Delete work order
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting work order:', error);
      throw error;
    }
  }
};
