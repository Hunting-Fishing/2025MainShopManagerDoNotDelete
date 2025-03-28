
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

// Format a date string (YYYY-MM-DD) to a more readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date);
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
