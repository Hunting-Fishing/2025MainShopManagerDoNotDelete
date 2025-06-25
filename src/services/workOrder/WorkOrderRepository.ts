
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { Database } from '@/integrations/supabase/types';

type WorkOrderTable = Database['public']['Tables']['work_orders'];
type WorkOrderInsert = WorkOrderTable['Insert'];
type WorkOrderUpdate = WorkOrderTable['Update'];
type WorkOrderRow = WorkOrderTable['Row'];

export class WorkOrderRepository {
  async findAll(): Promise<WorkOrder[]> {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles (
          id,
          make,
          model,
          year,
          license_plate,
          vin
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    return this.mapToWorkOrders(data || []);
  }

  async findById(id: string): Promise<WorkOrder | null> {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles (
          id,
          make,
          model,
          year,
          license_plate,
          vin
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch work order: ${error.message}`);
    }

    return this.mapToWorkOrder(data);
  }

  async create(workOrder: Partial<WorkOrderInsert>): Promise<WorkOrder> {
    const { data, error } = await supabase
      .from('work_orders')
      .insert(workOrder)
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles (
          id,
          make,
          model,
          year,
          license_plate,
          vin
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create work order: ${error.message}`);
    }

    return this.mapToWorkOrder(data);
  }

  async update(id: string, updates: Partial<WorkOrderUpdate>): Promise<WorkOrder> {
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        ...updates,
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
          phone
        ),
        vehicles (
          id,
          make,
          model,
          year,
          license_plate,
          vin
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update work order: ${error.message}`);
    }

    return this.mapToWorkOrder(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete work order: ${error.message}`);
    }
  }

  async findByCustomerId(customerId: string): Promise<WorkOrder[]> {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles (
          id,
          make,
          model,
          year,
          license_plate,
          vin
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch work orders by customer: ${error.message}`);
    }

    return this.mapToWorkOrders(data || []);
  }

  async updateStatus(id: string, status: string, userId?: string, userName?: string): Promise<WorkOrder> {
    // Start a transaction to update work order and log status change
    const { data: workOrder, error: updateError } = await supabase.rpc(
      'update_work_order_with_status_history',
      {
        p_work_order_id: id,
        p_new_status: status,
        p_changed_by: userId || null,
        p_changed_by_name: userName || 'System'
      }
    );

    if (updateError) {
      throw new Error(`Failed to update work order status: ${updateError.message}`);
    }

    // Fetch the updated work order
    return this.findById(id) as Promise<WorkOrder>;
  }

  private mapToWorkOrder(data: any): WorkOrder {
    const customer = data.customers;
    const vehicle = data.vehicles;

    return {
      id: data.id,
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      advisor_id: data.advisor_id,
      technician_id: data.technician_id,
      estimated_hours: data.estimated_hours,
      total_cost: data.total_cost,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      start_time: data.start_time,
      end_time: data.end_time,
      service_category_id: data.service_category_id,
      invoiced_at: data.invoiced_at,
      status: data.status,
      description: data.description,
      service_type: data.service_type,
      invoice_id: data.invoice_id,
      work_order_number: data.work_order_number,
      
      // Customer information
      customer_name: customer ? `${customer.first_name} ${customer.last_name}`.trim() : '',
      customer_first_name: customer?.first_name,
      customer_last_name: customer?.last_name,
      customer_email: customer?.email,
      customer_phone: customer?.phone,
      
      // Vehicle information
      vehicle_make: vehicle?.make,
      vehicle_model: vehicle?.model,
      vehicle_year: vehicle?.year?.toString(),
      vehicle_license_plate: vehicle?.license_plate,
      vehicle_vin: vehicle?.vin,
      
      // Legacy support
      customer: customer ? `${customer.first_name} ${customer.last_name}`.trim() : '',
      technician: data.technician || '',
      date: data.created_at,
      dueDate: data.due_date,
      due_date: data.due_date,
      priority: data.priority || 'medium',
      location: data.location,
      notes: data.notes,
    };
  }

  private mapToWorkOrders(data: any[]): WorkOrder[] {
    return data.map(item => this.mapToWorkOrder(item));
  }
}
