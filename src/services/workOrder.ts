
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';

export async function createWorkOrder(workOrderData: WorkOrderFormSchemaValues) {
  console.log('Creating work order with data:', workOrderData);
  
  try {
    // Prepare the work order data for insertion
    const workOrderInsert = {
      description: workOrderData.description,
      status: workOrderData.status || 'pending',
      customer_id: workOrderData.customerId || null,
      vehicle_id: workOrderData.vehicleId || null,
      technician_id: workOrderData.technicianId || null,
      // Store customer information directly if no customer_id
      customer_name: workOrderData.customer,
      customer_email: workOrderData.customerEmail || null,
      customer_phone: workOrderData.customerPhone || null,
      customer_address: workOrderData.customerAddress || null,
      // Store vehicle information directly
      vehicle_make: workOrderData.vehicleMake || null,
      vehicle_model: workOrderData.vehicleModel || null,
      vehicle_year: workOrderData.vehicleYear || null,
      vehicle_license_plate: workOrderData.licensePlate || null,
      vehicle_vin: workOrderData.vin || null,
      // Additional fields
      notes: workOrderData.notes || null,
      due_date: workOrderData.dueDate ? new Date(workOrderData.dueDate).toISOString() : null,
      priority: workOrderData.priority || 'medium',
      location: workOrderData.location || null,
    };

    console.log('Prepared work order insert:', workOrderInsert);

    // Insert the work order
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .insert(workOrderInsert)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating work order:', error);
      throw new Error(`Failed to create work order: ${error.message}`);
    }

    console.log('Work order created successfully:', workOrder);
    return workOrder;

  } catch (error) {
    console.error('Exception in createWorkOrder:', error);
    throw error;
  }
}

export async function updateWorkOrder(workOrderId: string, workOrderData: Partial<WorkOrderFormSchemaValues>) {
  console.log('Updating work order:', workOrderId, 'with data:', workOrderData);
  
  try {
    const workOrderUpdate = {
      description: workOrderData.description,
      status: workOrderData.status,
      customer_id: workOrderData.customerId || null,
      vehicle_id: workOrderData.vehicleId || null,
      technician_id: workOrderData.technicianId || null,
      customer_name: workOrderData.customer,
      customer_email: workOrderData.customerEmail || null,
      customer_phone: workOrderData.customerPhone || null,
      customer_address: workOrderData.customerAddress || null,
      vehicle_make: workOrderData.vehicleMake || null,
      vehicle_model: workOrderData.vehicleModel || null,
      vehicle_year: workOrderData.vehicleYear || null,
      vehicle_license_plate: workOrderData.licensePlate || null,
      vehicle_vin: workOrderData.vin || null,
      notes: workOrderData.notes || null,
      due_date: workOrderData.dueDate ? new Date(workOrderData.dueDate).toISOString() : null,
      priority: workOrderData.priority,
      location: workOrderData.location || null,
      updated_at: new Date().toISOString(),
    };

    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .update(workOrderUpdate)
      .eq('id', workOrderId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating work order:', error);
      throw new Error(`Failed to update work order: ${error.message}`);
    }

    console.log('Work order updated successfully:', workOrder);
    return workOrder;

  } catch (error) {
    console.error('Exception in updateWorkOrder:', error);
    throw error;
  }
}
