
import { Invoice, InvoiceItem, StaffMember } from "@/types/invoice";
import { v4 as uuidv4 } from 'uuid';

export const createEmptyInvoice = (): Invoice => {
  return {
    id: uuidv4(),
    customer: "",
    customer_address: "",
    customer_email: "",
    description: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "draft",
    items: [],
    created_by: "",
    created_at: new Date().toISOString(),
    shop_id: "default-shop",
    // Add aliases for compatibility
    customerAddress: "",
    customerEmail: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdBy: "",
    createdAt: new Date().toISOString(),
    // Add missing required fields
    assignedStaff: []
  };
};

export const mockInventoryItems = [
  {
    id: "inv-1",
    name: "Oil Filter",
    description: "High quality oil filter",
    price: 12.99,
    quantity: 15,
    category: "Parts",
    supplier: "AutoParts Inc."
  },
  {
    id: "inv-2",
    name: "Brake Pads",
    description: "Premium brake pads for all vehicle types",
    price: 45.99,
    quantity: 8,
    category: "Parts",
    supplier: "BrakeMasters"
  }
];

// Fix the staff members mock data
export const mockStaffMembers: StaffMember[] = [
  {
    id: "staff-1",
    name: "John Smith"
  },
  {
    id: "staff-2",
    name: "Jane Doe"
  }
];

export const mockWorkOrders = [
  {
    id: "wo-1",
    customer: "Michael Johnson",
    description: "Engine oil change and filter replacement",
    status: "in-progress"
  },
  {
    id: "wo-2",
    customer: "Sarah Williams",
    description: "Brake pad replacement and rotor inspection",
    status: "pending"
  }
];
