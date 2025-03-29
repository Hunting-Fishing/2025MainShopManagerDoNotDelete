
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";

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

// Types for work orders
export type WorkOrderStatus = keyof typeof statusMap;
export type WorkOrderPriority = keyof typeof priorityMap;

// Work order interface
export interface WorkOrder {
  id: string;
  customer: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  date: string;
  dueDate: string;
  technician: string;
  location: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
  timeEntries?: TimeEntry[];
  totalBillableTime?: number; // Total billable time in minutes
  createdBy?: string; // Person who created the work order
  createdAt?: string; // Creation timestamp
  lastUpdatedBy?: string; // Person who last updated the work order
  lastUpdatedAt?: string; // Last update timestamp
}

// Mock data for work orders
export const workOrders: WorkOrder[] = [
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
    timeEntries: [
      {
        id: "TE-001",
        employeeId: "EMP-001",
        employeeName: "Michael Brown",
        startTime: "2023-08-15T09:00:00Z",
        endTime: "2023-08-15T11:30:00Z",
        duration: 150, // 2.5 hours in minutes
        notes: "Initial diagnostic and repair work",
        billable: true
      },
      {
        id: "TE-002",
        employeeId: "EMP-001",
        employeeName: "Michael Brown",
        startTime: "2023-08-16T13:00:00Z",
        endTime: "2023-08-16T15:00:00Z",
        duration: 120, // 2 hours in minutes
        notes: "Completed system repair and testing",
        billable: true
      }
    ],
    totalBillableTime: 270 // 4.5 hours in minutes
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
    timeEntries: [
      {
        id: "TE-003",
        employeeId: "EMP-002",
        employeeName: "Sarah Johnson",
        startTime: "2023-08-12T08:00:00Z",
        endTime: "2023-08-12T16:00:00Z",
        duration: 480, // 8 hours in minutes
        notes: "Installation of security cameras and access control systems",
        billable: true
      },
      {
        id: "TE-004",
        employeeId: "EMP-002",
        employeeName: "Sarah Johnson",
        startTime: "2023-08-13T09:00:00Z",
        endTime: "2023-08-13T12:00:00Z",
        duration: 180, // 3 hours in minutes
        notes: "System configuration and testing",
        billable: true
      }
    ],
    totalBillableTime: 660 // 11 hours in minutes
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

// Get unique technicians from work orders
export const getUniqueTechnicians = (orders: WorkOrder[] = workOrders): string[] => {
  return Array.from(new Set(orders.map(order => order.technician))).sort();
};

// Helper function to format time in hours and minutes
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} mins`;
  } else if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} mins`;
  }
};

// Calculate total billable time for a work order
export const calculateTotalBillableTime = (timeEntries: TimeEntry[] = []): number => {
  return timeEntries.reduce((total, entry) => {
    return entry.billable ? total + entry.duration : total;
  }, 0);
};
