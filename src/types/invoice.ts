
export interface WorkOrder {
  id: string;
  customer: string;
  description: string;
  status: string;
  date: string;
  dueDate: string;
  priority: string;
  technician: string;
  location: string;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  customer: string;
  customerAddress: string;
  customerEmail: string;
  description: string;
  notes: string;
  date: string;
  dueDate: string;
  status: string;
  workOrderId: string;
  createdBy: string;
  assignedStaff: string[];
  items: InvoiceItem[];
}
