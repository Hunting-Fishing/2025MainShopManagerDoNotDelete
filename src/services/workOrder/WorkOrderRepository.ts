
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

export class WorkOrderRepository {
  async findAll(): Promise<WorkOrder[]> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles (
            id,
            make,
            model,
            year,
            license_plate,
            vin,
            odometer
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Repository: Error fetching work orders:', error);
        throw error;
      }

      return this.transformWorkOrders(data || []);
    } catch (error) {
      console.error('Repository: Error in findAll:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<WorkOrder | null> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles (
            id,
            make,
            model,
            year,
            license_plate,
            vin,
            odometer
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Repository: Error fetching work order by ID:', error);
        throw error;
      }

      return this.transformWorkOrder(data);
    } catch (error) {
      console.error('Repository: Error in findById:', error);
      throw error;
    }
  }

  async create(workOrderData: any): Promise<WorkOrder> {
    try {
      // Ensure required fields are set
      const dataToInsert = {
        ...workOrderData,
        status: workOrderData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('work_orders')
        .insert(dataToInsert)
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles (
            id,
            make,
            model,
            year,
            license_plate,
            vin,
            odometer
          )
        `)
        .single();

      if (error) {
        console.error('Repository: Error creating work order:', error);
        throw error;
      }

      return this.transformWorkOrder(data);
    } catch (error) {
      console.error('Repository: Error in create:', error);
      throw error;
    }
  }

  async update(id: string, updateData: any): Promise<WorkOrder> {
    try {
      // Ensure required fields are properly typed - don't make status optional
      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('work_orders')
        .update(dataToUpdate)
        .eq('id', id)
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles (
            id,
            make,
            model,
            year,
            license_plate,
            vin,
            odometer
          )
        `)
        .single();

      if (error) {
        console.error('Repository: Error updating work order:', error);
        throw error;
      }

      return this.transformWorkOrder(data);
    } catch (error) {
      console.error('Repository: Error in update:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: string, userId?: string, userName?: string): Promise<WorkOrder> {
    try {
      // First get the current work order to check old status
      const currentWorkOrder = await this.findById(id);
      if (!currentWorkOrder) {
        throw new Error(`Work order with ID ${id} not found`);
      }

      // Update the work order status
      const { data, error } = await supabase
        .from('work_orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles (
            id,
            make,
            model,
            year,
            license_plate,
            vin,
            odometer
          )
        `)
        .single();

      if (error) {
        console.error('Repository: Error updating work order status:', error);
        throw error;
      }

      // Record status history
      await this.recordStatusHistory(id, currentWorkOrder.status, status, userId, userName);

      return this.transformWorkOrder(data);
    } catch (error) {
      console.error('Repository: Error in updateStatus:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Repository: Error deleting work order:', error);
        throw error;
      }
    } catch (error) {
      console.error('Repository: Error in delete:', error);
      throw error;
    }
  }

  async findByCustomerId(customerId: string): Promise<WorkOrder[]> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          vehicles (
            id,
            make,
            model,
            year,
            license_plate,
            vin,
            odometer
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Repository: Error fetching work orders by customer:', error);
        throw error;
      }

      return this.transformWorkOrders(data || []);
    } catch (error) {
      console.error('Repository: Error in findByCustomerId:', error);
      throw error;
    }
  }

  private async recordStatusHistory(workOrderId: string, oldStatus: string | undefined, newStatus: string, userId?: string, userName?: string): Promise<void> {
    try {
      await supabase
        .from('work_order_status_history')
        .insert({
          work_order_id: workOrderId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: userId,
          changed_by_name: userName || 'System',
          changed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Repository: Error recording status history:', error);
      // Don't throw - status history is nice to have but not critical
    }
  }

  private transformWorkOrders(data: any[]): WorkOrder[] {
    return data.map(item => this.transformWorkOrder(item));
  }

  private transformWorkOrder(data: any): WorkOrder {
    const customer = data.customers;
    const vehicle = data.vehicles;

    return {
      id: data.id,
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      description: data.description,
      status: data.status,
      priority: data.priority,
      technician: data.technician,
      technician_id: data.technician_id,
      location: data.location,
      due_date: data.due_date,
      notes: data.notes,
      service_type: data.service_type,
      estimated_hours: data.estimated_hours,
      total_cost: data.total_cost,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by,
      
      // Customer fields
      customer_name: customer ? `${customer.first_name} ${customer.last_name}`.trim() : '',
      customer_first_name: customer?.first_name,
      customer_last_name: customer?.last_name,
      customer_email: customer?.email,
      customer_phone: customer?.phone,
      customer_address: customer?.address,
      customer_city: customer?.city,
      customer_state: customer?.state,
      customer_postal_code: customer?.postal_code,
      
      // Vehicle fields
      vehicle_make: vehicle?.make,
      vehicle_model: vehicle?.model,
      vehicle_year: vehicle?.year?.toString(),
      vehicle_license_plate: vehicle?.license_plate,
      vehicle_vin: vehicle?.vin,
      vehicle_odometer: vehicle?.odometer?.toString(),
      
      // Legacy fields for backward compatibility
      customer: customer ? `${customer.first_name} ${customer.last_name}`.trim() : '',
      dueDate: data.due_date,
      date: data.created_at,
      
      // Initialize arrays
      inventoryItems: data.inventory_items || [],
      timeEntries: data.time_entries || []
    };
  }
}
