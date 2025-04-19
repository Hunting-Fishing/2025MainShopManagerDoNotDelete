
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { generateWorkOrderId } from "../generators";
import { mapAppModelToDatabase } from "../mappers";

export const createWorkOrder = async (workOrderData: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
  try {
    const workOrderId = generateWorkOrderId();
    const currentDate = new Date().toISOString();

    // Map the data for Supabase
    const dbWorkOrderData = mapAppModelToDatabase(workOrderData);

    // Insert the work order
    const { data, error } = await supabase
      .from('work_orders')
      .insert(dbWorkOrderData)
      .select()
      .single();

    if (error) {
      console.error("Error creating work order:", error);
      throw new Error(error.message);
    }

    // Create base work order with required fields
    const baseWorkOrder: WorkOrder = {
      id: data.id,
      date: data.created_at,
      customer: workOrderData.customer,
      description: data.description,
      status: data.status as WorkOrder["status"],
      priority: workOrderData.priority,
      technician: workOrderData.technician,
      location: workOrderData.location,
      dueDate: data.end_time || '',
      notes: workOrderData.notes,
      inventoryItems: workOrderData.inventoryItems || [],
      timeEntries: workOrderData.timeEntries || [],
      totalBillableTime: workOrderData.totalBillableTime || 0,
      createdBy: workOrderData.createdBy || 'System',
      createdAt: data.created_at,
      lastUpdatedBy: workOrderData.lastUpdatedBy,
      lastUpdatedAt: data.updated_at,
      vehicle_id: data.vehicle_id,
      vehicleId: data.vehicle_id,
    };
    
    // Handle service category assignment
    if (workOrderData.serviceCategory) {
      baseWorkOrder.serviceCategory = workOrderData.serviceCategory;
      baseWorkOrder.service_category = workOrderData.serviceCategory;
    } else if (workOrderData.service_category) {
      baseWorkOrder.serviceCategory = workOrderData.service_category;
      baseWorkOrder.service_category = workOrderData.service_category;
    }

    return baseWorkOrder;
  } catch (err) {
    console.error("Error in createWorkOrder:", err);
    throw err;
  }
};
