
import { supabase } from "@/lib/supabase";
import { WorkOrder, TimeEntry } from "@/types/workOrder";

export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data.map(order => ({
      id: order.id,
      customer: order.customer || '',
      customer_id: order.customer_id,
      vehicle_id: order.vehicle_id,
      description: order.description || '',
      status: order.status,
      priority: order.priority || 'medium',
      date: order.created_at,
      dueDate: order.due_date,
      technician: order.technician,
      technician_id: order.technician_id,
      location: order.location || '',
      notes: order.notes || '',
      totalBillableTime: order.total_cost || 0,
      created_by: order.created_by || '',
      createdAt: order.created_at,
      last_updated_by: order.updated_at ? 'System' : '',
      lastUpdatedAt: order.updated_at || null,
      timeEntries: [],
      inventoryItems: []
    }));
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    // Fetch the work order
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }
    
    // Fetch the time entries
    const { data: timeEntries, error: timeEntriesError } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', id);
      
    if (timeEntriesError) {
      console.error("Error fetching time entries:", timeEntriesError);
    }
    
    // Fetch the inventory items
    const { data: inventoryItems, error: inventoryItemsError } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', id);
      
    if (inventoryItemsError) {
      console.error("Error fetching inventory items:", inventoryItemsError);
    }
    
    // Map the data to our WorkOrder type
    return {
      id: data.id,
      customer: data.customer || '',
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      description: data.description || '',
      status: data.status,
      priority: data.priority || 'medium',
      date: data.created_at,
      dueDate: data.due_date,
      technician: data.technician,
      technician_id: data.technician_id,
      location: data.location || '',
      notes: data.notes || '',
      totalBillableTime: data.total_cost || 0,
      created_by: data.created_by || '',
      createdAt: data.created_at,
      last_updated_by: data.updated_at ? 'System' : '',
      lastUpdatedAt: data.updated_at || null,
      timeEntries: timeEntries || [],
      inventoryItems: inventoryItems || []
    };
  } catch (error) {
    console.error(`Error fetching work order ${id}:`, error);
    return null;
  }
};

export const createWorkOrder = async (workOrder: Partial<WorkOrder>): Promise<WorkOrder> => {
  try {
    // Insert the work order
    const { data, error } = await supabase
      .from('work_orders')
      .insert([{
        customer: workOrder.customer,
        customer_id: workOrder.customer_id,
        vehicle_id: workOrder.vehicle_id,
        description: workOrder.description,
        status: workOrder.status || 'pending',
        priority: workOrder.priority || 'medium',
        due_date: workOrder.dueDate,
        technician: workOrder.technician,
        technician_id: workOrder.technician_id,
        location: workOrder.location,
        notes: workOrder.notes,
        created_by: workOrder.created_by || 'system',
        service_type: workOrder.service_type
      }])
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // Insert time entries if available
    if (workOrder.timeEntries && workOrder.timeEntries.length > 0) {
      const entries = workOrder.timeEntries.map(entry => ({
        work_order_id: data.id,
        employee_id: entry.employee_id,
        employee_name: entry.employee_name,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration: entry.duration,
        notes: entry.notes,
        billable: entry.billable
      }));
      
      await supabase
        .from('work_order_time_entries')
        .insert(entries);
    }
    
    // Insert inventory items if available
    if (workOrder.inventoryItems && workOrder.inventoryItems.length > 0) {
      const items = workOrder.inventoryItems.map(item => ({
        work_order_id: data.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));
      
      await supabase
        .from('work_order_inventory_items')
        .insert(items);
    }
    
    // Return the created work order
    return {
      ...data,
      timeEntries: workOrder.timeEntries || [],
      inventoryItems: workOrder.inventoryItems || []
    } as WorkOrder;
  } catch (error) {
    console.error("Error creating work order:", error);
    throw error;
  }
};

export const updateWorkOrder = async (workOrder: Partial<WorkOrder>): Promise<WorkOrder> => {
  try {
    // Update the work order
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        customer: workOrder.customer,
        customer_id: workOrder.customer_id,
        vehicle_id: workOrder.vehicle_id,
        description: workOrder.description,
        status: workOrder.status,
        priority: workOrder.priority,
        due_date: workOrder.dueDate,
        technician: workOrder.technician,
        technician_id: workOrder.technician_id,
        location: workOrder.location,
        notes: workOrder.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', workOrder.id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return getWorkOrderById(data.id) as Promise<WorkOrder>;
  } catch (error) {
    console.error(`Error updating work order ${workOrder.id}:`, error);
    throw error;
  }
};

export const addTimeEntry = async (workOrderId: string, entry: Partial<TimeEntry>): Promise<TimeEntry> => {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .insert([{
        work_order_id: workOrderId,
        employee_id: entry.employee_id,
        employee_name: entry.employee_name,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration: entry.duration,
        notes: entry.notes,
        billable: entry.billable
      }])
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error adding time entry to work order ${workOrderId}:`, error);
    throw error;
  }
};

export const deleteWorkOrder = async (id: string): Promise<boolean> => {
  try {
    // First delete related time entries and inventory items due to foreign key constraints
    await supabase.from('work_order_time_entries').delete().eq('work_order_id', id);
    await supabase.from('work_order_inventory_items').delete().eq('work_order_id', id);
    
    // Now delete the work order
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting work order ${id}:`, error);
    return false;
  }
};
