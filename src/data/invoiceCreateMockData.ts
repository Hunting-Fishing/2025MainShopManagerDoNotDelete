
import { WorkOrder, StaffMember } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { formatTimeInHoursAndMinutes } from "@/data/workOrdersData";

// Mock data for work orders with time entries
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
  // more work orders...
];

// Mock data for inventory items (in a real app would be fetched from API)
export const inventoryItems: InventoryItem[] = [
  {
    id: "INV-1001",
    name: "HVAC Filter - Premium",
    sku: "HVF-P-100",
    category: "HVAC",
    price: 24.99,
    description: "High-efficiency particulate air filter",
  },
  {
    id: "INV-1002",
    name: "Copper Pipe - 3/4\" x 10'",
    sku: "CP-34-10",
    category: "Plumbing",
    price: 18.75,
    description: "Standard copper pipe for plumbing installations",
  },
  {
    id: "INV-1003",
    name: "Circuit Breaker - 30 Amp",
    sku: "CB-30A",
    category: "Electrical",
    price: 42.50,
    description: "30 Amp circuit breaker for electrical panels",
  },
  // more inventory items...
];

// Mock data for staff members (in a real app would be fetched from API)
export const staffMembers: StaffMember[] = [
  { id: 1, name: "Michael Brown", role: "Technician" },
  { id: 2, name: "Sarah Johnson", role: "Technician" },
  { id: 3, name: "David Lee", role: "Technician" },
  { id: 4, name: "Emily Chen", role: "Technician" },
  { id: 5, name: "James Wilson", role: "Office Manager" },
];
