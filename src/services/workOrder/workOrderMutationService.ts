
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { getWorkOrderById } from "./workOrderQueryService";

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
      customer_address,
      customer_city,
      customer_state,
      customer_zip,
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
    
    // Record creation activity
    if (data?.id) {
      await recordWorkOrderActivity(
        data.id,
        'Work order created',
        'system',
        'System'
      );
    }
    
    // Fetch the complete work order with relationships
    const fullWorkOrder = await getWorkOrderById(data.id);
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
      customer_address,
      customer_city,
      customer_state,
      customer_zip,
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
    const fullWorkOrder = await getWorkOrderById(data.id);
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
 * Update work order status with proper activity logging
 */
export const updateWorkOrderStatus = async (id: string, status: string): Promise<WorkOrder | null> => {
  try {
    console.log('Updating work order status:', id, 'to:', status);
    
    // First get the current work order to record the old status
    const currentWorkOrder = await getWorkOrderById(id);
    if (!currentWorkOrder) {
      throw new Error('Work order not found');
    }
    
    const oldStatus = currentWorkOrder.status;
    
    // Get current user info for activity logging
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    
    const userName = profile 
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || 'Unknown User'
      : user.email || 'Unknown User';
    
    // Update the work order status
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
    
    // Record the status change activity using the SECURITY DEFINER function
    if (oldStatus !== status) {
      try {
        const { error: activityError } = await supabase.rpc('record_status_change_activity', {
          p_work_order_id: id,
          p_old_status: oldStatus,
          p_new_status: status,
          p_user_id: user.id,
          p_user_name: userName
        });
        
        if (activityError) {
          console.error('Error recording status change activity:', activityError);
          // Don't throw here - status update succeeded, activity logging is secondary
        }
      } catch (activityErr) {
        console.error('Failed to record activity:', activityErr);
        // Continue - the main status update succeeded
      }
    }
    
    // Fetch the complete work order with relationships
    const fullWorkOrder = await getWorkOrderById(data.id);
    return fullWorkOrder;
  } catch (error) {
    console.error(`Error updating work order status ${id}:`, error);
    throw error;
  }
};

/**
 * Record work order activity with proper error handling
 */
export const recordWorkOrderActivity = async (
  workOrderId: string,
  action: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('record_work_order_activity', {
      p_action: action,
      p_work_order_id: workOrderId,
      p_user_id: userId,
      p_user_name: userName
    });
    
    if (error) {
      console.error('Error recording work order activity:', error);
      // Don't throw - activity logging is secondary to main operations
    }
  } catch (error) {
    console.error('Failed to record work order activity:', error);
    // Don't throw - activity logging is secondary to main operations
  }
};
