
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  full_name?: string;
  
  // Legacy compatibility
  name?: string;
}
