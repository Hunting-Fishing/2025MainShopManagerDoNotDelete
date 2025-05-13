
import { supabase } from "@/lib/supabase";
import { DbTimeEntry, TimeEntry, WorkOrder } from "@/types/workOrder";
import { toast } from "sonner";

/**
 * Fetch a list of unique technicians from the work_orders table
 */
export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician')
      .not('technician', 'is', null)
      .order('technician');
    
    if (error) throw error;
    
    // Get unique technician values
    const uniqueTechnicians: string[] = [];
    data.forEach(row => {
      if (row.technician && !uniqueTechnicians.includes(row.technician)) {
        uniqueTechnicians.push(row.technician);
      }
    });
    
    return uniqueTechnicians;
  } catch (err) {
    console.error('Error fetching technicians:', err);
    return [];
  }
}

/**
 * Delete a work order by ID
 */
export async function deleteWorkOrder(id: string): Promise<boolean> {
  try {
    // Delete associated time entries
    await supabase.rpc('delete_work_order_time_entries', { work_order_id: id });
    
    // Delete associated inventory items
    await supabase.rpc('delete_work_order_inventory_items', { work_order_id: id });
    
    // Delete the work order
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (err) {
    console.error('Error deleting work order:', err);
    toast.error('Failed to delete work order');
    return false;
  }
}

/**
 * Update an existing work order
 */
export async function updateWorkOrder(workOrder: Partial<WorkOrder>): Promise<WorkOrder | null> {
  try {
    // Update the work order
    const { data, error } = await supabase
      .from('work_orders')
      .update(workOrder)
      .eq('id', workOrder.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update successful
    return data;
  } catch (err) {
    console.error('Error updating work order:', err);
    toast.error('Failed to update work order');
    return null;
  }
}

/**
 * Normalize a work order from the database format to the frontend format
 */
export function normalizeWorkOrder(workOrder: any): WorkOrder {
  return {
    id: workOrder.id,
    customer: workOrder.customer || '',
    customer_id: workOrder.customer_id,
    description: workOrder.description || '',
    status: workOrder.status || 'pending',
    priority: workOrder.priority || 'medium',
    technician: workOrder.technician || '',
    technician_id: workOrder.technician_id,
    date: workOrder.date || new Date().toISOString(),
    dueDate: workOrder.dueDate || workOrder.due_date || new Date().toISOString().split('T')[0],
    location: workOrder.location || '',
    notes: workOrder.notes || '',
    vehicle_id: workOrder.vehicle_id || '',
    serviceCategory: workOrder.serviceCategory || workOrder.service_category || '',
    estimatedHours: workOrder.estimated_hours || workOrder.estimatedHours || undefined,
    vehicleMake: workOrder.vehicleMake || workOrder.vehicle_make || '',
    vehicleModel: workOrder.vehicleModel || workOrder.vehicle_model || '',
    vehicleYear: workOrder.vehicleYear || (workOrder.vehicleDetails?.year || ''),
    // Add other fields as needed
  };
}
