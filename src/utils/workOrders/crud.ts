
import { supabase } from "@/lib/supabase";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { generateWorkOrderId } from "./generators";
import { mapDatabaseToAppModel, mapAppModelToDatabase } from "./mappers";

// Get unique technicians for filtering
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`id, first_name, last_name`)
      .order('first_name');
      
    if (error) {
      console.error("Error fetching technicians:", error);
      return [];
    }
    
    return data
      .map(profile => `${profile.first_name || ''} ${profile.last_name || ''}`.trim())
      .filter(name => name.length > 0)
      .sort();
  } catch (err) {
    console.error("Error in getUniqueTechnicians:", err);
    return [];
  }
};

// Create a new work order
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

    // After creating the work order, add any inventory items
    if (workOrderData.inventoryItems && workOrderData.inventoryItems.length > 0) {
      await addInventoryItemsToWorkOrder(data.id, workOrderData.inventoryItems);
    }

    // Add time entries if provided
    if (workOrderData.timeEntries && workOrderData.timeEntries.length > 0) {
      await addTimeEntriesToWorkOrder(data.id, workOrderData.timeEntries);
    }

    // Create a base work order with required fields
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
      vehicleId: data.vehicle_id, // Include both casing conventions for frontend compatibility
    };
    
    // Handle service category assignment safely
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

// Helper function to add inventory items to a work order
async function addInventoryItemsToWorkOrder(workOrderId: string, items: WorkOrderInventoryItem[]) {
  const inventoryItems = items.map(item => ({
    work_order_id: workOrderId,
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    unit_price: item.unitPrice
  }));

  const { error } = await supabase
    .from('work_order_inventory_items')
    .insert(inventoryItems);

  if (error) {
    console.error("Error adding inventory items:", error);
    throw error;
  }
}

// Helper function to add time entries to a work order
async function addTimeEntriesToWorkOrder(workOrderId: string, entries: TimeEntry[]) {
  const timeEntries = entries.map(entry => ({
    work_order_id: workOrderId,
    employee_id: entry.employeeId,
    employee_name: entry.employeeName,
    start_time: entry.startTime,
    end_time: entry.endTime,
    duration: entry.duration,
    notes: entry.notes || '',
    billable: entry.billable
  }));

  const { error } = await supabase
    .from('work_order_time_entries')
    .insert(timeEntries);

  if (error) {
    console.error("Error adding time entries:", error);
    throw error;
  }
}

// Find a work order by ID
export const findWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        work_order_time_entries(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error finding work order:", error);
      return null;
    }
    
    if (!data) return null;
    
    // Fetch customer data separately
    let customerData = null;
    if (data.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('first_name, last_name')
        .eq('id', data.customer_id)
        .single();
      customerData = customer;
    }
    
    // Fetch technician data separately
    let technicianData = null;
    if (data.technician_id) {
      const { data: technician } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', data.technician_id)
        .single();
      technicianData = technician;
    }
    
    // Combine all the data
    const workOrderWithRelations = {
      ...data,
      customers: customerData,
      profiles: technicianData
    };
    
    // Map database model to application model
    return mapDatabaseToAppModel(workOrderWithRelations) as WorkOrder;
  } catch (err) {
    console.error("Error in findWorkOrderById:", err);
    return null;
  }
};

// Update a work order
export const updateWorkOrder = async (updatedWorkOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    // Map from app model to database model
    const dbData = mapAppModelToDatabase(updatedWorkOrder);
    
    const { data, error } = await supabase
      .from('work_orders')
      .update(dbData)
      .eq('id', updatedWorkOrder.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating work order:", error);
      throw new Error(error.message);
    }
    
    return {
      ...updatedWorkOrder,
      lastUpdatedAt: data.updated_at
    };
  } catch (err) {
    console.error("Error in updateWorkOrder:", err);
    throw err;
  }
};

// Delete a work order
export const deleteWorkOrder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting work order:", error);
      throw new Error(error.message);
    }

    return true;
  } catch (err) {
    console.error("Error in deleteWorkOrder:", err);
    throw err;
  }
};
