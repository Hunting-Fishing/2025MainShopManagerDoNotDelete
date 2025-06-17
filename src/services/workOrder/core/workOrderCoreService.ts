
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
      // Map our WorkOrder type to database schema
      const dbData = {
        status: workOrderData.status || 'pending',
        description: workOrderData.description,
        customer_id: workOrderData.customer_id,
        vehicle_id: workOrderData.vehicle_id,
        technician_id: workOrderData.technician_id,
        advisor_id: workOrderData.advisor_id,
        estimated_hours: workOrderData.estimated_hours,
        total_cost: workOrderData.total_cost,
        service_type: workOrderData.service_type,
        work_order_number: workOrderData.work_order_number,
        start_time: workOrderData.start_time,
        end_time: workOrderData.end_time
      };

      const { data, error } = await supabase
        .from('work_orders')
        .insert(dbData)
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
      // Map our WorkOrder type to database schema
      const dbUpdates = {
        status: updates.status,
        description: updates.description,
        customer_id: updates.customer_id,
        vehicle_id: updates.vehicle_id,
        technician_id: updates.technician_id,
        advisor_id: updates.advisor_id,
        estimated_hours: updates.estimated_hours,
        total_cost: updates.total_cost,
        service_type: updates.service_type,
        work_order_number: updates.work_order_number,
        start_time: updates.start_time,
        end_time: updates.end_time,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      const { data, error } = await supabase
        .from('work_orders')
        .update(dbUpdates)
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
