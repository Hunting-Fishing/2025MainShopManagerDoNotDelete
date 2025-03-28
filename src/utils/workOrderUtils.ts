
import { WorkOrder, statusMap, priorityMap, workOrders } from "@/data/workOrdersData";
import { toast } from "@/hooks/use-toast";

// Find a work order by ID
export const findWorkOrderById = (id: string): WorkOrder | undefined => {
  return workOrders.find(order => order.id === id);
};

// Update a work order (simulated API call)
export const updateWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
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
};

// Create a new work order (simulated API call)
export const createWorkOrder = async (workOrderData: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
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
};

// Format a date string (YYYY-MM-DD) to a more readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date);
};

// Create a new invoice from a work order (simulated API call)
export const createInvoiceFromWorkOrder = async (
  workOrderId: string,
  invoiceData: any
): Promise<any> => {
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
};

// Pagination utilities
export const paginateData = <T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
): T[] => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return data.slice(indexOfFirstItem, indexOfLastItem);
};

export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};
