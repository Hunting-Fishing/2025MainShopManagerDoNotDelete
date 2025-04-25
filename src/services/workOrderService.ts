
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';

// Get work order details
export async function getWorkOrder(id: string): Promise<WorkOrder> {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customer:customer_id (id, first_name, last_name, email, phone, address),
      vehicle:vehicle_id (id, make, model, year, vin)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching work order:', error);
    throw error;
  }

  return data as unknown as WorkOrder;
}

// Update work order inventory items
export async function updateWorkOrderInventoryItems(workOrderId: string, items: WorkOrderInventoryItem[]): Promise<void> {
  try {
    // First, delete any existing inventory items for this work order
    const { error: deleteError } = await supabase
      .rpc('delete_work_order_inventory_items', { work_order_id: workOrderId });

    if (deleteError) throw deleteError;

    // Then insert the new items
    for (const item of items) {
      const { error: insertError } = await supabase
        .rpc('insert_work_order_inventory_item', {
          p_work_order_id: workOrderId,
          p_name: item.name,
          p_sku: item.sku,
          p_category: item.category,
          p_quantity: item.quantity,
          p_unit_price: item.unitPrice
        });

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating work order inventory items:', error);
    throw error;
  }
}

// Get work order inventory items
export async function getWorkOrderInventoryItems(workOrderId: string): Promise<WorkOrderInventoryItem[]> {
  const { data, error } = await supabase
    .rpc('get_work_order_inventory_items', { work_order_id: workOrderId });

  if (error) {
    console.error('Error fetching work order inventory items:', error);
    throw error;
  }

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    unitPrice: item.unit_price
  }));
}

// Get work order time entries
export async function getWorkOrderTimeEntries(workOrderId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .rpc('get_work_order_time_entries', { work_order_id: workOrderId });

  if (error) {
    console.error('Error fetching work order time entries:', error);
    throw error;
  }

  return data;
}

// Add time entry
export async function addTimeEntry(workOrderId: string, entry: Omit<TimeEntry, 'id'>): Promise<string> {
  const { data, error } = await supabase
    .rpc('insert_work_order_time_entry', {
      p_work_order_id: workOrderId,
      p_employee_id: entry.employeeId,
      p_employee_name: entry.employeeName,
      p_start_time: entry.startTime,
      p_end_time: entry.endTime || null,
      p_duration: entry.duration,
      p_notes: entry.notes || '',
      p_billable: entry.billable
    });

  if (error) {
    console.error('Error adding work order time entry:', error);
    throw error;
  }

  return data as string;
}

export async function updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<void> {
  const { error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating work order:', error);
    throw error;
  }
}
