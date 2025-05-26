
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { WorkOrder } from "@/types/workOrder";

// This file now re-exports the hook that fetches data from the database
export { useInvoiceData };

// For backwards compatibility - sample work orders with proper typing
export const sampleWorkOrders: WorkOrder[] = [
  {
    id: "wo-001",
    customer_id: "cust-001",
    customer: "ABC Auto Parts",
    vehicle_id: "veh-001",
    status: "completed",
    description: "Oil change and tire rotation",
    total_cost: 125.50,
    timeEntries: [],
    date: "2024-01-15",
    dueDate: "2024-01-16",
    priority: "medium",
    technician: "John Smith",
    location: "Bay 1",
    total_billable_time: 2.5,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "wo-002",
    customer_id: "cust-002",
    customer: "Fleet Solutions Inc",
    vehicle_id: "veh-002",
    status: "in-progress",
    description: "Brake system inspection and repair",
    total_cost: 450.00,
    timeEntries: [],
    date: "2024-01-16",
    dueDate: "2024-01-17",
    priority: "high",
    technician: "Sarah Johnson",
    location: "Bay 2",
    total_billable_time: 4.0,
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T11:00:00Z"
  },
  {
    id: "wo-003",
    customer_id: "cust-003",
    customer: "Metro Transit Authority",
    vehicle_id: "veh-003",
    status: "pending",
    description: "Engine diagnostic and transmission service",
    total_cost: 800.00,
    timeEntries: [],
    date: "2024-01-17",
    dueDate: "2024-01-18",
    priority: "urgent",
    technician: "Mike Davis",
    location: "Bay 3",
    total_billable_time: 6.5,
    created_at: "2024-01-17T07:30:00Z",
    updated_at: "2024-01-17T07:30:00Z"
  }
];

// For backwards compatibility, but no mock data fallbacks
export const workOrders = sampleWorkOrders;
