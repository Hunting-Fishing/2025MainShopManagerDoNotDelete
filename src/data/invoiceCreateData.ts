// Make sure to import the WorkOrder type to ensure proper type checking
import { WorkOrder } from "@/types/workOrder";

export const customers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    vehicles: [
      {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2019,
        licensePlate: 'ABC-123'
      }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '555-987-6543',
    address: '456 Elm St, Anytown, USA',
    vehicles: [
      {
        id: '2',
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        licensePlate: 'DEF-456'
      }
    ]
  }
];

export const technicians = [
  {
    id: '1',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '555-111-2222',
    skills: ['Oil Change', 'Tire Rotation', 'Brake Service']
  },
  {
    id: '2',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '555-333-4444',
    skills: ['Engine Repair', 'Transmission Service', 'Electrical Diagnostics']
  }
];

export const services = [
  {
    id: '1',
    name: 'Oil Change',
    description: 'Standard oil and filter change',
    price: 75.00,
    laborHours: 1.0
  },
  {
    id: '2',
    name: 'Tire Rotation',
    description: 'Rotate tires to ensure even wear',
    price: 30.00,
    laborHours: 0.5
  },
  {
    id: '3',
    name: 'Brake Service',
    description: 'Inspect and replace brake pads',
    price: 150.00,
    laborHours: 2.0
  }
];

export const workOrders: WorkOrder[] = [
  {
    id: '1',
    customer_id: '1',
    customer_name: 'John Doe',
    customer: 'John Doe',
    vehicle_id: '1',
    vehicle_info: '2019 Toyota Camry',
    status: 'completed' as const, // Use 'as const' to fix the type issue
    description: 'Regular maintenance',
    total_cost: 150.00,
    timeEntries: [],
    created_at: '2023-05-01T10:00:00Z',
    updated_at: '2023-05-01T14:30:00Z',
    notes: 'Customer requested oil change and tire rotation',
    parts: [],
    technician_id: '1',
    technician_name: 'Bob Smith',
    totalBillableTime: 2
  },
  {
    id: '2',
    customer_id: '2',
    customer_name: 'Jane Smith',
    customer: 'Jane Smith',
    vehicle_id: '2',
    vehicle_info: '2020 Honda Civic',
    status: 'in-progress' as const, // Use 'as const' to fix the type issue
    description: 'Brake service',
    total_cost: 150.00,
    timeEntries: [],
    created_at: '2023-05-02T08:00:00Z',
    updated_at: '2023-05-02T12:00:00Z',
    notes: 'Customer reported squeaking brakes',
    parts: [],
    technician_id: '2',
    technician_name: 'Alice Johnson',
    totalBillableTime: 2
  }
];

export const invoiceItems = [
  {
    id: '1',
    name: 'Oil Change',
    description: 'Standard oil and filter change',
    quantity: 1,
    unitPrice: 75.00
  },
  {
    id: '2',
    name: 'Tire Rotation',
    description: 'Rotate tires to ensure even wear',
    quantity: 1,
    unitPrice: 30.00
  }
];
