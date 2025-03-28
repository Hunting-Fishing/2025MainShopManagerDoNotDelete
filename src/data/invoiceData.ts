
// Mock data for invoices
export const invoices = [
  {
    id: "INV-2023-001",
    workOrderId: "WO-2023-0012",
    customer: "Acme Corporation",
    description: "HVAC System Repair",
    total: 1250.00,
    status: "paid",
    date: "2023-08-16",
    dueDate: "2023-09-15",
    createdBy: "Michael Brown",
    items: [
      { id: 1, name: "HVAC Filter - Premium", quantity: 2, price: 24.99 },
      { id: 2, name: "Service Labor (hours)", quantity: 6, price: 200.00 }
    ]
  },
  {
    id: "INV-2023-002",
    workOrderId: "WO-2023-0011",
    customer: "Johnson Residence",
    description: "Electrical Panel Upgrade",
    total: 875.50,
    status: "pending",
    date: "2023-08-15",
    dueDate: "2023-09-14",
    createdBy: "Sarah Johnson",
    items: [
      { id: 1, name: "Circuit Breaker - 30 Amp", quantity: 3, price: 42.50 },
      { id: 2, name: "Service Labor (hours)", quantity: 5, price: 150.00 }
    ]
  },
  {
    id: "INV-2023-003",
    workOrderId: "WO-2023-0010",
    customer: "City Hospital",
    description: "Security System Installation",
    total: 3200.00,
    status: "overdue",
    date: "2023-08-13",
    dueDate: "2023-09-12",
    createdBy: "David Lee",
    items: [
      { id: 1, name: "Security Cameras", quantity: 8, price: 250.00 },
      { id: 2, name: "Door Lock Set - Commercial Grade", quantity: 4, price: 89.99 },
      { id: 3, name: "Service Labor (hours)", quantity: 8, price: 175.00 }
    ]
  },
  {
    id: "INV-2023-004",
    workOrderId: "WO-2023-0008",
    customer: "Green Valley School",
    description: "Fire Alarm System Inspection",
    total: 650.00,
    status: "paid",
    date: "2023-08-10",
    dueDate: "2023-09-09",
    createdBy: "Emily Chen",
    items: [
      { id: 1, name: "Fire Alarm Components", quantity: 0, price: 0 },
      { id: 2, name: "Inspection Service", quantity: 1, price: 650.00 }
    ]
  },
  {
    id: "INV-2023-005",
    workOrderId: "WO-2023-0007",
    customer: "Sunset Restaurant",
    description: "Kitchen Equipment Repair",
    total: 1475.25,
    status: "draft",
    date: "2023-08-08",
    dueDate: "2023-09-07",
    createdBy: "Michael Brown",
    items: [
      { id: 1, name: "Kitchen Equipment Parts", quantity: 3, price: 325.00 },
      { id: 2, name: "Service Labor (hours)", quantity: 3, price: 166.75 }
    ]
  }
];
