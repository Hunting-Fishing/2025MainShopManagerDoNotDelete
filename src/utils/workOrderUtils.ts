import { WorkOrder } from "@/types/workOrder";
import { supabase } from "@/integrations/supabase/client";

// Generate a unique work order ID
export const generateWorkOrderId = (): string => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WO-${dateStr}-${randomStr}`;
};

// Format date for display
export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Create a new work order
export const createWorkOrder = async (workOrderData: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
  try {
    const workOrderId = generateWorkOrderId();
    const currentDate = new Date().toISOString();

    // Helper function to convert camelCase to snake_case
    const mapCamelToSnakeCase = (data: any) => {
      // Handle specific field mappings
      const result: any = {};

      // Handle service category property (which could be either serviceCategory or service_category)
      if (data.serviceCategory !== undefined) {
        result.service_category = data.serviceCategory;
      } else if (data.service_category !== undefined) {
        result.service_category = data.service_category;
      }

      // Handle vehicle properties
      if (data.vehicleId !== undefined) {
        result.vehicle_id = data.vehicleId;
      } else if (data.vehicle_id !== undefined) {
        result.vehicle_id = data.vehicle_id;
      }

      if (data.vehicleMake !== undefined) {
        result.vehicle_make = data.vehicleMake;
      } else if (data.vehicle_make !== undefined) {
        result.vehicle_make = data.vehicle_make;
      }

      if (data.vehicleModel !== undefined) {
        result.vehicle_model = data.vehicleModel;
      } else if (data.vehicle_model !== undefined) {
        result.vehicle_model = data.vehicle_model;
      }

      // Standard fields
      result.description = data.description;
      result.status = data.status;
      result.customer = data.customer;
      result.customer_id = typeof data.customer !== 'string' ? data.customer : null;
      result.technician = data.technician;
      result.technician_id = typeof data.technician !== 'string' ? data.technician : null;
      result.location = data.location;
      result.notes = data.notes || '';
      result.due_date = data.dueDate;
      result.priority = data.priority;
      result.total_cost = data.total_cost || 0;
      result.estimated_hours = data.estimated_hours || null;

      return result;
    };

    // Map the data for Supabase
    const dbWorkOrderData = mapCamelToSnakeCase(workOrderData);

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
      const inventoryItems = workOrderData.inventoryItems.map(item => ({
        work_order_id: data.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }));

      const { error: inventoryError } = await supabase
        .from('work_order_inventory_items')
        .insert(inventoryItems);

      if (inventoryError) {
        console.error("Error adding inventory items:", inventoryError);
      }
    }

    // Add time entries if provided
    if (workOrderData.timeEntries && workOrderData.timeEntries.length > 0) {
      const timeEntries = workOrderData.timeEntries.map(entry => ({
        work_order_id: data.id,
        employee_id: entry.employeeId,
        employee_name: entry.employeeName,
        start_time: entry.startTime,
        end_time: entry.endTime,
        duration: entry.duration,
        notes: entry.notes || '',
        billable: entry.billable
      }));

      const { error: timeError } = await supabase
        .from('work_order_time_entries')
        .insert(timeEntries);

      if (timeError) {
        console.error("Error adding time entries:", timeError);
      }
    }

    // Map response back to our application format
    return {
      id: data.id,
      date: data.created_at,
      customer: workOrderData.customer,
      description: data.description,
      status: data.status as WorkOrder["status"],
      priority: workOrderData.priority,
      technician: workOrderData.technician,
      location: workOrderData.location,
      dueDate: data.due_date || '',
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
      service_category: data.service_category,
      serviceCategory: data.service_category, // Include both casing conventions for frontend compatibility
    };
  } catch (err) {
    console.error("Error in createWorkOrder:", err);
    throw err;
  }
};

// Find a work order by ID
export const findWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers(first_name, last_name),
        profiles(first_name, last_name),
        work_order_time_entries(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error finding work order:", error);
      return null;
    }
    
    if (!data) return null;
    
    const customers = data.customers as any || {};
    const profiles = data.profiles as any || {};
    const statusValue = data.status || 'pending';
    // Ensure status is one of the allowed values
    let typedStatus: WorkOrder["status"] = "pending";
    if (statusValue === "in-progress" || statusValue === "completed" || statusValue === "cancelled") {
      typedStatus = statusValue;
    }
    
    return {
      id: data.id,
      date: data.created_at,
      customer: `${customers?.first_name || ''} ${customers?.last_name || ''}`.trim(),
      description: data.description || '',
      status: typedStatus,
      priority: data.priority,
      technician: `${profiles?.first_name || ''} ${profiles?.last_name || ''}`.trim() || 'Unassigned',
      location: '', // Not available in schema yet
      dueDate: data.end_time || '',
      notes: '',
      timeEntries: data.work_order_time_entries || [],
      totalBillableTime: data.work_order_time_entries?.reduce((sum, entry) => 
        sum + (entry.billable ? (entry.duration || 0) : 0), 0) || 0,
      createdBy: 'System',
      createdAt: data.created_at,
      lastUpdatedBy: '',
      lastUpdatedAt: data.updated_at,
      vehicle_id: data.vehicle_id,
      vehicleId: data.vehicle_id,
      service_category: data.service_category,
      serviceCategory: data.service_category
    };
  } catch (err) {
    console.error("Error in findWorkOrderById:", err);
    return null;
  }
};

// Update a work order
export const updateWorkOrder = async (updatedWorkOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        description: updatedWorkOrder.description,
        status: updatedWorkOrder.status,
        // Map other fields as needed
      })
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

// Add missing utility functions
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  if (!minutes) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${remainingMinutes}m`;
};

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
