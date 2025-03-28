
// Define the customer interface
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  notes?: string;
  dateAdded: string;
  lastServiceDate?: string;
  status: 'active' | 'inactive';
}
