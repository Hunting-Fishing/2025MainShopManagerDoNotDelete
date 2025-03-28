
// Work order status definitions
export const statusMap = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled",
};

// Priority level definitions with styling
export const priorityMap = {
  "high": { label: "High", classes: "bg-red-100 text-red-800" },
  "medium": { label: "Medium", classes: "bg-yellow-100 text-yellow-800" },
  "low": { label: "Low", classes: "bg-green-100 text-green-800" },
};

// Mock data for work orders
export const workOrders = [
  {
    id: "WO-2023-0012",
    customer: "Acme Corporation",
    description: "HVAC System Repair",
    status: "in-progress",
    date: "2023-08-15",
    dueDate: "2023-08-20",
    priority: "high",
    technician: "Michael Brown",
    location: "123 Business Park, Suite 400",
  },
  {
    id: "WO-2023-0011",
    customer: "Johnson Residence",
    description: "Electrical Panel Upgrade",
    status: "pending",
    date: "2023-08-14",
    dueDate: "2023-08-22",
    priority: "medium",
    technician: "Unassigned",
    location: "456 Maple Street",
  },
  {
    id: "WO-2023-0010",
    customer: "City Hospital",
    description: "Security System Installation",
    status: "completed",
    date: "2023-08-12",
    dueDate: "2023-08-16",
    priority: "high",
    technician: "Sarah Johnson",
    location: "789 Medical Center Drive",
  },
  {
    id: "WO-2023-0009",
    customer: "Metro Hotel",
    description: "Plumbing System Maintenance",
    status: "cancelled",
    date: "2023-08-10",
    dueDate: "2023-08-14",
    priority: "low",
    technician: "David Lee",
    location: "321 Downtown Avenue",
  },
  {
    id: "WO-2023-0008",
    customer: "Green Valley School",
    description: "Fire Alarm System Inspection",
    status: "completed",
    date: "2023-08-08",
    dueDate: "2023-08-12",
    priority: "medium",
    technician: "Emily Chen",
    location: "555 Education Road",
  },
  {
    id: "WO-2023-0007",
    customer: "Sunset Restaurant",
    description: "Kitchen Equipment Repair",
    status: "in-progress",
    date: "2023-08-05",
    dueDate: "2023-08-09",
    priority: "high",
    technician: "Michael Brown",
    location: "777 Culinary Place",
  },
  {
    id: "WO-2023-0006",
    customer: "Parkview Apartments",
    description: "HVAC Maintenance - Multiple Units",
    status: "pending",
    date: "2023-08-03",
    dueDate: "2023-08-18",
    priority: "medium",
    technician: "Unassigned",
    location: "888 Residential Circle",
  },
];

// Types for work orders
export type WorkOrderStatus = keyof typeof statusMap;
export type WorkOrderPriority = keyof typeof priorityMap;

export interface WorkOrder {
  id: string;
  customer: string;
  description: string;
  status: WorkOrderStatus;
  date: string;
  dueDate: string;
  priority: WorkOrderPriority;
  technician: string;
  location: string;
}

// Get unique technicians from work orders
export const getUniqueTechnicians = (orders: WorkOrder[]): string[] => {
  return Array.from(new Set(orders.map(order => order.technician))).sort();
};
