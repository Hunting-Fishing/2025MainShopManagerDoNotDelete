
import { WorkOrder, statusMap, priorityMap, workOrders } from "@/data/workOrdersData";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";

// Find a work order by ID
export const findWorkOrderById = (id: string): WorkOrder | undefined => {
  try {
    return workOrders.find(order => order.id === id);
  } catch (error) {
    handleApiError(error, "Error finding work order");
    return undefined;
  }
};

// Update a work order (simulated API call)
export const updateWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    // Simulating an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the index of the work order to update
    const index = workOrders.findIndex(order => order.id === workOrder.id);
    
    if (index !== -1) {
      // Update the work order in the array
      workOrders[index] = { ...workOrder };
      return workOrders[index];
    }
    
    throw new Error("Work order not found");
  } catch (error) {
    // Enhanced error handling
    const formattedError = handleApiError(error, "Failed to update work order");
    throw new Error(formattedError.message);
  }
};

// Delete a work order (simulated API call)
export const deleteWorkOrder = async (id: string): Promise<void> => {
  try {
    // Simulating an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the index of the work order to delete
    const index = workOrders.findIndex(order => order.id === id);
    
    if (index !== -1) {
      // Remove the work order from the array
      workOrders.splice(index, 1);
      return;
    }
    
    throw new Error("Work order not found");
  } catch (error) {
    // Enhanced error handling
    const formattedError = handleApiError(error, "Failed to delete work order");
    throw new Error(formattedError.message);
  }
};

// Create a new work order (simulated API call)
export const createWorkOrder = async (workOrderData: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
  try {
    // Simulating an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a unique ID for the work order
    const newId = `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create the new work order with current date
    const newWorkOrder: WorkOrder = {
      id: newId,
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      ...workOrderData,
    };
    
    // Add the new work order to the array
    workOrders.unshift(newWorkOrder);
    
    return newWorkOrder;
  } catch (error) {
    // Enhanced error handling
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

// Create a new invoice from a work order (simulated API call)
export const createInvoiceFromWorkOrder = async (
  workOrderId: string,
  invoiceData: any
): Promise<any> => {
  try {
    // Simulating an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the referenced work order
    const workOrder = findWorkOrderById(workOrderId);
    
    if (!workOrder) {
      throw new Error("Referenced work order not found");
    }
    
    // Generate a unique ID for the invoice
    const newId = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    
    // Create the new invoice
    const newInvoice = {
      id: newId,
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      workOrderId: workOrderId,
      ...invoiceData,
    };
    
    // In a real app, this would be added to an invoices array or database
    console.log("New invoice created:", newInvoice);
    
    return newInvoice;
  } catch (error) {
    // Enhanced error handling
    const formattedError = handleApiError(error, "Failed to create invoice from work order");
    throw new Error(formattedError.message);
  }
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
