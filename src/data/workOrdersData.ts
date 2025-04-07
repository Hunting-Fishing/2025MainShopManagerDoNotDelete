
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';

// Mock data for Work Orders
export interface WorkOrder {
  id: string;
  date: string;
  customer: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  location: string;
  dueDate: string;
  notes?: string;
  inventoryItems?: any[];
  timeEntries?: any[];
  serviceCategory?: string;
  vehicleId?: string;
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: string;
    odometer?: string;
    licensePlate?: string;
  };
}

// Define status colors and labels
export const statusMap: Record<string, string> = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled"
};

// Define priority display properties
export const priorityMap: Record<
  string, 
  { label: string; classes: string; }
> = {
  "low": {
    label: "Low",
    classes: "bg-slate-100 text-slate-700"
  },
  "medium": {
    label: "Medium",
    classes: "bg-blue-100 text-blue-700"
  },
  "high": {
    label: "High", 
    classes: "bg-red-100 text-red-700"
  }
};

// Generate a realistic list of work orders
const generateWorkOrders = (): WorkOrder[] => {
  // Generate mock data with various statuses and priorities
  return [
    {
      id: "WO-2023-001",
      date: "2023-09-15T10:30:00",
      customer: "John Smith",
      description: "Oil change and tire rotation",
      status: "completed",
      priority: "medium",
      technician: "Michael Brown",
      location: "Bay 3",
      dueDate: format(addDays(new Date(), -5), "yyyy-MM-dd"),
    },
    {
      id: "WO-2023-002",
      date: "2023-09-17T14:15:00",
      customer: "Sarah Johnson",
      description: "Check engine light diagnosis and repair",
      status: "in-progress",
      priority: "high",
      technician: "David Lee",
      location: "Bay 1",
      dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      notes: "Customer reported intermittent stalling at highway speeds."
    },
    {
      id: "WO-2023-003",
      date: "2023-09-18T09:00:00",
      customer: "Robert Davis",
      description: "Replace brake pads and rotors",
      status: "pending",
      priority: "medium",
      technician: "Emily Chen",
      location: "Bay 2",
      dueDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    },
    {
      id: "WO-2023-004",
      date: "2023-09-14T11:45:00",
      customer: "Jennifer Wilson",
      description: "A/C system not cooling properly",
      status: "completed",
      priority: "medium",
      technician: "Michael Brown",
      location: "Bay 4",
      dueDate: format(addDays(new Date(), -3), "yyyy-MM-dd"),
      notes: "Recharged refrigerant and replaced cabin air filter."
    },
    {
      id: "WO-2023-005",
      date: "2023-09-16T16:30:00",
      customer: "Michael Thomas",
      description: "Alignment and suspension check",
      status: "cancelled",
      priority: "low",
      technician: "David Lee",
      location: "Bay 2",
      dueDate: format(addDays(new Date(), -1), "yyyy-MM-dd"),
      notes: "Customer called to cancel - rescheduling for next week."
    },
    {
      id: "WO-2023-006",
      date: "2023-09-19T13:00:00",
      customer: "Lisa Anderson",
      description: "30,000 mile maintenance service",
      status: "pending",
      priority: "medium",
      technician: "Emily Chen",
      location: "Bay 3",
      dueDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
    },
    {
      id: "WO-2023-007",
      date: "2023-09-16T10:00:00",
      customer: "James Martinez",
      description: "Replace serpentine belt and tensioner",
      status: "in-progress",
      priority: "high",
      technician: "Michael Brown",
      location: "Bay 1",
      dueDate: format(addDays(new Date(), 0), "yyyy-MM-dd"),
      notes: "Parts are on backorder, expected arrival tomorrow."
    },
    {
      id: "WO-2023-008",
      date: "2023-09-20T09:30:00",
      customer: "Patricia Taylor",
      description: "Transmission fluid flush",
      status: "pending",
      priority: "low",
      technician: "David Lee",
      location: "Bay 4",
      dueDate: format(addDays(new Date(), 4), "yyyy-MM-dd"),
    }
  ];
};

export const workOrders = generateWorkOrders();

// Create a new work order
export const createWorkOrder = async (workOrder: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
  const newWorkOrder: WorkOrder = {
    id: `WO-${new Date().getFullYear()}-${String(workOrders.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString(),
    ...workOrder,
  };
  
  // Add to the list (in a real app, this would be saved to a database)
  workOrders.unshift(newWorkOrder);
  
  // For demo purposes, pretend this is an async API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(newWorkOrder), 300);
  });
};

// Find a work order by ID
export const findWorkOrderById = (id: string): Promise<WorkOrder | null> => {
  return new Promise((resolve) => {
    const workOrder = workOrders.find((wo) => wo.id === id);
    setTimeout(() => resolve(workOrder || null), 300);
  });
};

// Update a work order
export const updateWorkOrder = async (updatedWorkOrder: WorkOrder): Promise<WorkOrder> => {
  return new Promise((resolve, reject) => {
    const index = workOrders.findIndex((wo) => wo.id === updatedWorkOrder.id);
    if (index !== -1) {
      workOrders[index] = { ...updatedWorkOrder };
      setTimeout(() => resolve(workOrders[index]), 300);
    } else {
      setTimeout(() => reject(new Error("Work order not found")), 300);
    }
  });
};
