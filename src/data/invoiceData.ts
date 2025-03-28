
import { Invoice } from "@/types/invoice";

// Mock data for invoices with the structure matching the Invoice type
export const invoices = [
  {
    id: "INV-2023-001",
    workOrderId: "WO-2023-0012",
    customer: "Acme Corporation",
    customerAddress: "123 Business Park, Suite 400, San Francisco, CA 94107",
    customerEmail: "billing@acmecorp.com",
    description: "HVAC System Repair",
    notes: "All work completed according to specifications. 1-year warranty on parts and labor.",
    total: 1250.00,
    subtotal: 1150.00,
    tax: 100.00,
    status: "paid",
    paymentMethod: "Credit Card",
    date: "2023-08-16",
    dueDate: "2023-09-15",
    createdBy: "Michael Brown",
    assignedStaff: ["Michael Brown"],
    items: [
      { id: "1", name: "HVAC Filter - Premium", description: "High-efficiency particulate air filter", quantity: 2, price: 24.99, total: 49.98 },
      { id: "2", name: "Service Labor", description: "Technician hours for system repair and maintenance", quantity: 6, hours: true, price: 200.00, total: 1200.00 }
    ]
  },
  {
    id: "INV-2023-002",
    workOrderId: "WO-2023-0011",
    customer: "Johnson Residence",
    customerAddress: "456 Maple Street, Anytown, CA 95123",
    customerEmail: "johnson@example.com",
    description: "Electrical Panel Upgrade",
    notes: "Customer requested upgrade to 200 amp service.",
    total: 875.50,
    subtotal: 810.65,
    tax: 64.85,
    status: "pending",
    date: "2023-08-15",
    dueDate: "2023-09-14",
    createdBy: "Sarah Johnson",
    assignedStaff: ["Sarah Johnson", "David Lee"],
    items: [
      { id: "1", name: "Circuit Breaker - 30 Amp", description: "Standard circuit breaker", quantity: 3, price: 42.50, total: 127.50 },
      { id: "2", name: "Service Labor", description: "Electrical work", quantity: 5, price: 150.00, total: 750.00 }
    ]
  },
  {
    id: "INV-2023-003",
    workOrderId: "WO-2023-0010",
    customer: "City Hospital",
    customerAddress: "789 Healthcare Blvd, Cityville, CA 90210",
    customerEmail: "facilities@cityhospital.org",
    description: "Security System Installation",
    notes: "Installation of security cameras and door access control systems.",
    total: 3200.00,
    subtotal: 2962.96,
    tax: 237.04,
    status: "overdue",
    date: "2023-08-13",
    dueDate: "2023-09-12",
    createdBy: "David Lee",
    assignedStaff: ["David Lee", "Emily Chen"],
    items: [
      { id: "1", name: "Security Cameras", description: "HD security cameras", quantity: 8, price: 250.00, total: 2000.00 },
      { id: "2", name: "Door Lock Set - Commercial Grade", description: "Electronic access control", quantity: 4, price: 89.99, total: 359.96 },
      { id: "3", name: "Service Labor", description: "Installation labor", quantity: 8, price: 175.00, total: 1400.00 }
    ]
  },
  {
    id: "INV-2023-004",
    workOrderId: "WO-2023-0008",
    customer: "Green Valley School",
    customerAddress: "321 Education Lane, Green Valley, CA 94530",
    customerEmail: "maintenance@gvschool.edu",
    description: "Fire Alarm System Inspection",
    notes: "Annual inspection and certification of fire alarm system.",
    total: 650.00,
    subtotal: 601.85,
    tax: 48.15,
    status: "paid",
    date: "2023-08-10",
    dueDate: "2023-09-09",
    createdBy: "Emily Chen",
    assignedStaff: ["Emily Chen"],
    items: [
      { id: "1", name: "Fire Alarm Components", description: "Replacement components", quantity: 0, price: 0, total: 0 },
      { id: "2", name: "Inspection Service", description: "Full system inspection", quantity: 1, price: 650.00, total: 650.00 }
    ]
  },
  {
    id: "INV-2023-005",
    workOrderId: "WO-2023-0007",
    customer: "Sunset Restaurant",
    customerAddress: "567 Dining Street, Beachside, CA 92651",
    customerEmail: "manager@sunsetrestaurant.com",
    description: "Kitchen Equipment Repair",
    notes: "Repair of industrial refrigerator and dishwasher.",
    total: 1475.25,
    subtotal: 1365.97,
    tax: 109.28,
    status: "draft",
    date: "2023-08-08",
    dueDate: "2023-09-07",
    createdBy: "Michael Brown",
    assignedStaff: ["Michael Brown"],
    items: [
      { id: "1", name: "Kitchen Equipment Parts", description: "Replacement parts for commercial equipment", quantity: 3, price: 325.00, total: 975.00 },
      { id: "2", name: "Service Labor", description: "Repair and maintenance", quantity: 3, price: 166.75, total: 500.25 }
    ]
  }
];
