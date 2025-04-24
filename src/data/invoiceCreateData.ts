
// Update the WorkOrder related data to match the required type
import { WorkOrder } from "@/types/workOrder";

// Sample invoice data for demonstration
export const sampleInvoiceData = {
  id: "INV-1234",
  customer: "John Doe",
  customer_address: "123 Main St, Anytown, CA 12345",
  customer_email: "john.doe@example.com",
  description: "Monthly vehicle maintenance",
  notes: "Thank you for your business!",
  date: "2023-04-15",
  due_date: "2023-05-15",
  status: "draft",
  subtotal: 450,
  tax: 36,
  total: 486,
  items: [
    {
      id: "item1",
      name: "Oil Change",
      description: "Full synthetic oil change service",
      quantity: 1,
      price: 89.99,
      total: 89.99
    },
    {
      id: "item2",
      name: "Tire Rotation",
      description: "Tire rotation service",
      quantity: 4,
      price: 20,
      total: 80
    },
    {
      id: "item3",
      name: "Brake Inspection",
      description: "Complete brake system inspection",
      quantity: 1,
      price: 129.99,
      total: 129.99
    },
    {
      id: "item4",
      name: "Air Filter Replacement",
      description: "Engine air filter replacement",
      quantity: 1,
      price: 49.99,
      total: 49.99
    },
    {
      id: "item5",
      name: "Wiper Blade Replacement",
      description: "Front and rear wiper blade replacement",
      quantity: 1,
      price: 49.99,
      total: 49.99
    }
  ]
};

// Sample customer data
export const sampleCustomerData = [
  {
    id: "cust1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "555-123-4567",
    address: "123 Main St, Anytown, CA 12345"
  },
  {
    id: "cust2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "555-987-6543",
    address: "456 Oak Ave, Somewhere, CA 54321"
  }
];

// Sample work order data that matches the WorkOrder type
export const sampleWorkOrderData: WorkOrder[] = [
  {
    id: "WO-1234",
    customer: "John Doe",
    customer_id: "cust1",
    description: "Regular maintenance and oil change",
    status: "completed", 
    priority: "medium", 
    technician: "Mike Johnson",
    date: "2023-04-10",
    dueDate: "2023-04-12",
    location: "Main Shop",
    notes: "Customer requested synthetic oil",
    inventoryItems: [
      {
        id: "inv1",
        name: "Synthetic Oil",
        sku: "OIL-SYN-5W30",
        category: "Fluids",
        quantity: 1,
        unitPrice: 45.99
      },
      {
        id: "inv2",
        name: "Oil Filter",
        sku: "FIL-OIL-1234",
        category: "Filters",
        quantity: 1,
        unitPrice: 12.99
      }
    ],
    timeEntries: [],
    totalBillableTime: 45,
    technician_id: "tech1",
    vehicle_id: "v123",
    vehicle_make: "Toyota",
    vehicle_model: "Camry"
  },
  {
    id: "WO-5678",
    customer: "Jane Smith",
    customer_id: "cust2",
    description: "Brake system inspection and repair",
    status: "in-progress",
    priority: "high",
    technician: "Sarah Williams",
    date: "2023-04-14",
    dueDate: "2023-04-16",
    location: "Main Shop",
    notes: "Customer reported squeaking noise when braking",
    inventoryItems: [
      {
        id: "inv3",
        name: "Brake Pads (Front)",
        sku: "BRK-PAD-F22",
        category: "Brakes",
        quantity: 1,
        unitPrice: 89.99
      },
      {
        id: "inv4",
        name: "Brake Fluid",
        sku: "FLD-BRK-DOT4",
        category: "Fluids",
        quantity: 1,
        unitPrice: 19.99
      }
    ],
    timeEntries: [],
    totalBillableTime: 120,
    technician_id: "tech2",
    vehicle_id: "v456",
    vehicle_make: "Honda",
    vehicle_model: "Accord"
  }
];
