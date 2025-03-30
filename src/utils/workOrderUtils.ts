
import { WorkOrder, statusMap, priorityMap } from "@/data/workOrdersData";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";

// Find a work order by ID
export const findWorkOrderById = async (id: string): Promise<WorkOrder | undefined> => {
  try {
    // Get the work order from Supabase
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!workOrder) return undefined;
    
    // Fetch time entries for this work order
    const { data: timeEntries, error: timeEntriesError } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', id);
      
    if (timeEntriesError) throw timeEntriesError;
    
    // Fetch inventory items for this work order
    const { data: inventoryItems, error: inventoryItemsError } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', id);
      
    if (inventoryItemsError) throw inventoryItemsError;
    
    // Combine all data into the WorkOrder object
    return {
      ...workOrder,
      timeEntries: timeEntries || [],
      inventoryItems: inventoryItems || []
    } as WorkOrder;
  } catch (error) {
    handleApiError(error, "Error finding work order");
    return undefined;
  }
};

// Update a work order
export const updateWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    // Extract time entries and inventory items
    const timeEntries = workOrder.timeEntries || [];
    const inventoryItems = workOrder.inventoryItems || [];
    
    // Create a copy of the work order without these arrays
    const { timeEntries: _, inventoryItems: __, ...workOrderData } = workOrder;
    
    // Update the work order in Supabase
    const { data, error } = await supabase
      .from('work_orders')
      .update(workOrderData)
      .eq('id', workOrder.id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Handle time entries updates
    if (timeEntries.length > 0) {
      // First delete existing time entries
      const { error: deleteError } = await supabase
        .from('work_order_time_entries')
        .delete()
        .eq('work_order_id', workOrder.id);
        
      if (deleteError) throw deleteError;
      
      // Then insert the updated ones
      const { error: insertError } = await supabase
        .from('work_order_time_entries')
        .insert(
          timeEntries.map(entry => ({
            ...entry,
            work_order_id: workOrder.id
          }))
        );
        
      if (insertError) throw insertError;
    }
    
    // Handle inventory items updates
    if (inventoryItems.length > 0) {
      // First delete existing inventory items
      const { error: deleteError } = await supabase
        .from('work_order_inventory_items')
        .delete()
        .eq('work_order_id', workOrder.id);
        
      if (deleteError) throw deleteError;
      
      // Then insert the updated ones
      const { error: insertError } = await supabase
        .from('work_order_inventory_items')
        .insert(
          inventoryItems.map(item => ({
            ...item,
            work_order_id: workOrder.id,
            unit_price: item.unitPrice // Map to the database column name
          }))
        );
        
      if (insertError) throw insertError;
    }
    
    // Record activity
    await recordWorkOrderActivity("Updated", workOrder.id, "system", workOrder.lastUpdatedBy || "System");
    
    return {
      ...data,
      timeEntries,
      inventoryItems
    } as WorkOrder;
  } catch (error) {
    const formattedError = handleApiError(error, "Failed to update work order");
    throw new Error(formattedError.message);
  }
};

// Delete a work order
export const deleteWorkOrder = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    // Note: We don't need to delete time entries or inventory items manually
    // because we've set up ON DELETE CASCADE in the database
    
    // Record activity
    await recordWorkOrderActivity("Deleted", id, "system", "System", false);
  } catch (error) {
    const formattedError = handleApiError(error, "Failed to delete work order");
    throw new Error(formattedError.message);
  }
};

// Create a new work order
export const createWorkOrder = async (workOrderData: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
  try {
    // Extract time entries and inventory items
    const timeEntries = workOrderData.timeEntries || [];
    const inventoryItems = workOrderData.inventoryItems || [];
    
    // Create a copy of the work order without these arrays
    const { timeEntries: _, inventoryItems: __, ...workOrderInfo } = workOrderData;
    
    // Set the current date
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Create the work order in Supabase
    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        ...workOrderInfo,
        date: currentDate
      })
      .select()
      .single();
      
    if (error) throw error;
    
    const workOrderId = data.id;
    
    // Handle time entries if present
    if (timeEntries.length > 0) {
      const { error: timeError } = await supabase
        .from('work_order_time_entries')
        .insert(
          timeEntries.map(entry => ({
            ...entry,
            work_order_id: workOrderId
          }))
        );
        
      if (timeError) throw timeError;
    }
    
    // Handle inventory items if present
    if (inventoryItems.length > 0) {
      const { error: inventoryError } = await supabase
        .from('work_order_inventory_items')
        .insert(
          inventoryItems.map(item => ({
            ...item,
            work_order_id: workOrderId,
            unit_price: item.unitPrice // Map to the database column name
          }))
        );
        
      if (inventoryError) throw inventoryError;
    }
    
    // Record activity
    await recordWorkOrderActivity("Created", workOrderId, "system", workOrderData.createdBy || "System");
    
    // Return the complete work order
    return {
      ...data,
      timeEntries,
      inventoryItems
    } as WorkOrder;
  } catch (error) {
    const formattedError = handleApiError(error, "Failed to create work order");
    throw new Error(formattedError.message);
  }
};

// Format a date string (YYYY-MM-DD) to a more readable format
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Fallback to original string if formatting fails
  }
};

// Create a new invoice from a work order (to be implemented)
export const createInvoiceFromWorkOrder = async (
  workOrderId: string,
  invoiceData: any
): Promise<any> => {
  // This function would be implemented later when integrating invoices with Supabase
  console.log("Creating invoice from work order:", workOrderId, invoiceData);
  return { id: `INV-${Date.now()}` };
};

// Pagination utilities
export const paginateData = <T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
): T[] => {
  try {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  } catch (error) {
    console.error("Pagination error:", error);
    return []; // Return empty array as fallback
  }
};

export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  try {
    return Math.ceil(totalItems / itemsPerPage);
  } catch (error) {
    console.error("Error calculating total pages:", error);
    return 1; // Return minimum 1 page as fallback
  }
};

// Function to record work order activity in Supabase
export const recordWorkOrderActivity = async (
  action: string,
  workOrderId: string,
  userId: string,
  userName: string,
  showToast: boolean = true
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: workOrderId,
        action,
        user_id: userId,
        user_name: userName
      });
      
    if (error) throw error;
    
    if (showToast) {
      toast({
        title: "Activity Recorded",
        description: `${action} work order ${workOrderId}`,
        variant: "success",
      });
    }
  } catch (error) {
    console.error("Error recording activity:", error);
  }
};
