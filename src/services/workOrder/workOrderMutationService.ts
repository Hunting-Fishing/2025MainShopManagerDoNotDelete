
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { normalizeWorkOrder } from "@/utils/workOrders/formatters";

/**
 * Create a new work order with proper vehicle relationship handling
 */
export const createWorkOrder = async (workOrder: Partial<WorkOrder>): Promise<WorkOrder | null> => {
  try {
    console.log('Creating work order with data:', workOrder);
    
    // Prepare the work order data for insertion
    const workOrderData = {
      status: 'pending',
      ...workOrder,
      // Ensure we have the right field names for the database
      customer_id: workOrder.customer_id || null,
      vehicle_id: workOrder.vehicle_id || null,
      description: workOrder.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Remove any UI-only fields that shouldn't go to the database
    const {
      customer,
      date,
      dueDate,
      technician,
      priority,
      location,
      notes,
      total_billable_time,
      vehicle,
      customer_name,
      customer_email,
      customer_phone,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      vehicle_vin,
      vehicle_license_plate,
      timeEntries,
      inventoryItems,
      jobLines,
      ...dbData
    } = workOrderData;

    console.log('Inserting work order data:', dbData);

    const { data, error } = await supabase
      .from('work_orders')
      .insert([dbData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating work order:', error);
      throw error;
    }
    
    console.log('Work order created successfully:', data);
    
    // Fetch the complete work order with relationships
    const fullWorkOrder = await getWorkOrderWithRelationships(data.id);
    return fullWorkOrder;
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
};

/**
 * Update an existing work order
 */
export const updateWorkOrder = async (workOrder: Partial<WorkOrder>): Promise<WorkOrder | null> => {
  try {
    if (!workOrder.id) {
      throw new Error('Work order ID is required for update');
    }
    
    console.log('Updating work order:', workOrder.id, 'with data:', workOrder);
    
    // Prepare update data, removing UI-only fields
    const {
      customer,
      date,
      dueDate,
      technician,
      priority,
      location,
      notes,
      total_billable_time,
      vehicle,
      customer_name,
      customer_email,
      customer_phone,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      vehicle_vin,
      vehicle_license_plate,
      timeEntries,
      inventoryItems,
      jobLines,
      ...updateData
    } = workOrder;

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('work_orders')
      .update(updateData)
      .eq('id', workOrder.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating work order:', error);
      throw error;
    }
    
    console.log('Work order updated successfully:', data);
    
    // Fetch the complete work order with relationships
    const fullWorkOrder = await getWorkOrderWithRelationships(data.id);
    return fullWorkOrder;
  } catch (error) {
    console.error('Error updating work order:', error);
    throw error;
  }
};

/**
 * Delete a work order by ID
 */
export const deleteWorkOrder = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting work order:', id);
    
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting work order:', error);
      throw error;
    }
    
    console.log('Work order deleted successfully:', id);
    return true;
  } catch (error) {
    console.error(`Error deleting work order ${id}:`, error);
    return false;
  }
};

/**
 * Update work order status
 */
export const updateWorkOrderStatus = async (id: string, status: string): Promise<WorkOrder | null> => {
  try {
    console.log('Updating work order status:', id, 'to:', status);
    
    const { data, error } = await supabase
      .from('work_orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating work order status:', error);
      throw error;
    }
    
    console.log('Work order status updated successfully:', data);
    
    // Fetch the complete work order with relationships
    const fullWorkOrder = await getWorkOrderWithRelationships(data.id);
    return fullWorkOrder;
  } catch (error) {
    console.error(`Error updating work order status ${id}:`, error);
    throw error;
  }
};

/**
 * Helper function to get work order with full relationships
 */
async function getWorkOrderWithRelationships(id: string): Promise<WorkOrder | null> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicle:vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching work order with relationships:', error);
      throw error;
    }

    return normalizeWorkOrder(data);
  } catch (error) {
    console.error('Error in getWorkOrderWithRelationships:', error);
    return null;
  }
}
